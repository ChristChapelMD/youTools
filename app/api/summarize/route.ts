import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

import { fetchTranscript } from "./fetchTranscript";

import { summarizeTranscript } from "@/app/api/summarize/summarizeTranscript";
import { createClient } from "@/utils/supabase/server";

async function getYouTubeTranscript(video_id: string) {
  if (!video_id) {
    throw new Error("Invalid video URL or missing video ID");
  }

  try {
    const { title, transcript } = await fetchTranscript(video_id);

    return {
      title: title ?? "Title not available",
      transcript: transcript?.join(" ") ?? "Transcript not available",
    };
  } catch (error: any) {
    console.error("Error fetching transcript:", error.message);
    throw new Error("Failed to fetch transcript");
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const video_id = searchParams.get("video_id");
  const extension = searchParams.get("extension") === "true";
  const save = searchParams.get("save") === "true";

  const supabase = await createClient();
  let userId: string | null = null;

  // Helper to get video data
  async function getVideoData(video_id: string) {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title")
      .eq("video_id", video_id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching video data:", error);
      throw error;
    }

    return data;
  }

  // Helper to get existing summary
  async function getSummary(videoIdInDb: string) {
    const { data: existingSummary, error } = await supabase
      .from("summaries")
      .select("id, content")
      .eq("video_id", videoIdInDb)
      .maybeSingle();

    if (error) {
      console.error("Error fetching summary:", error);

      return null;
    }

    return existingSummary;
  }

  try {
    if (!extension) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      userId = user?.id ?? null;
    } else {
      const access_token = request.headers
        .get("Authorization")
        ?.split("Bearer ")[1];
      const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

      if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

      if (!access_token) throw new Error("Missing access_token");
      const decodedToken = jwt.verify(access_token, JWT_SECRET);

      userId =
        typeof decodedToken["sub"] === "string" ? decodedToken["sub"] : null;
    }

    const videoData = await getVideoData(video_id!);
    let videoIdInDb = videoData?.id;

    if (!videoIdInDb) {
      if (!video_id) throw new Error("Missing video_id");
      const { title } = await getYouTubeTranscript(video_id);
      const { data: newVideo } = await supabase
        .from("videos")
        .insert({ video_id, title })
        .select()
        .single();

      videoIdInDb = newVideo.id;
    }

    const existingSummary = await getSummary(videoIdInDb);

    if (existingSummary) {
      return new Response(
        JSON.stringify({
          title: videoData?.title || "Unknown Title",
          summary: existingSummary.content,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const { title, transcript } = await getYouTubeTranscript(video_id!);
    const summaryContent = await summarizeTranscript(transcript);

    if (save) {
      await supabase.from("summaries").insert({
        video_id: videoIdInDb,
        user_id: userId,
        content: summaryContent,
      });
    }

    return new Response(JSON.stringify({ title, summary: summaryContent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error.message);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
