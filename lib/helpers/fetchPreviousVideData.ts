import { createClient } from "@/utils/supabase/server";

export type Video = {
  id: number;
  videoId: string;
  title: string | null;
};

export type Summary = {
  id: number;
  videoId: number;
  userId: string | null;
  content: string;
  version: number;
  created_at: string;
};

export type VideoWithSummary = {
  id: number;
  videoId: string;
  title: string | null;
  summary: string;
  endTime: string;
  datePosted: string;
};

export async function fetchVideosWithSummaries(): Promise<VideoWithSummary[]> {
  console.log("Creating Supabase client...");
  const supabase = await createClient();

  console.log("Fetching videos...");
  const { data: videos, error: videoError } = await supabase
    .from("videos")
    .select("id, videoId, title");

  if (videoError) {
    console.error("Error fetching videos:", videoError);

    return [];
  }

  console.log("Videos fetched:", videos);

  console.log("Fetching summaries...");
  const { data: summaries, error: summaryError } = await supabase
    .from("summaries")
    .select("videoId, content, created_at");

  if (summaryError) {
    console.error("Error fetching summaries:", summaryError);

    return [];
  }

  console.log("Summaries fetched:", summaries);

  const videosWithSummaries = videos.map((video) => {
    const summary = summaries.find((s) => s.videoId === video.id);

    console.log(`Processing video with ID: ${video.id}`);
    console.log(
      `Found summary: ${summary ? summary.content : "No summary found"}`,
    );

    return {
      id: video.id,
      videoId: video.videoId,
      title: video.title,
      summary: summary ? summary.content : "",
      endTime: summary ? summary.created_at : "",
      datePosted: summary ? summary.created_at : "",
    };
  });

  console.log("Videos with summaries:", videosWithSummaries);

  return videosWithSummaries;
}
