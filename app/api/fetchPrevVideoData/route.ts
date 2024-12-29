import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export type Video = {
  id: number;
  video_id: string;
  title: string | null;
};

export type Summary = {
  id: number;
  video_id: number;
  user_id: string | null;
  content: string;
  created_at: string;
};

export type VideoWithSummary = {
  id: number;
  video_id: string;
  title: string | null;
  summary: string;
  endTime: string;
  datePosted: string;
};

export async function GET(_request: NextRequest) {
  const supabase = await createClient();

  async function getVideoData(): Promise<Video[]> {
    const { data, error } = await supabase
      .from("videos")
      .select("id, video_id, title");

    if (error) {
      console.error("Error fetching video data:", error);
      throw error;
    }

    return data || [];
  }

  async function getSummaries(videoIds: number[]): Promise<Summary[]> {
    const { data, error } = await supabase
      .from("summaries")
      .select("id, video_id, user_id, content, created_at")
      .in("video_id", videoIds);

    if (error) {
      console.error("Error fetching summaries:", error);
      throw error;
    }

    return data || [];
  }

  try {
    // Fetch all videos
    const videos = await getVideoData();

    if (videos.length === 0) {
      return NextResponse.json(
        { error: "No videos found in the database" },
        { status: 404 },
      );
    }

    const videoIds = videos.map((video) => video.id);
    const summaries = await getSummaries(videoIds);

    // Map videos with summaries
    const videosWithSummaries: VideoWithSummary[] = videos.map((video) => {
      const summary = summaries.find((s) => s.video_id === video.id);

      return {
        id: video.id,
        video_id: video.video_id,
        title: video.title,
        summary: summary ? summary.content : "",
        endTime: summary ? summary.created_at : "",
        datePosted: summary ? summary.created_at : "",
      };
    });

    // Return the result
    return NextResponse.json(videosWithSummaries);
  } catch (error) {
    console.error("Error processing request:", error);

    return NextResponse.json(
      { error: "An error occurred while processing the request." },
      { status: 500 },
    );
  }
}
