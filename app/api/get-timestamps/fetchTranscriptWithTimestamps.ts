import { Innertube } from "youtubei.js/web";

export const fetchTranscriptWithTimestamps = async (video_id: string) => {
  const youtube = await Innertube.create({
    lang: "en",
    location: "US",
    retrieve_player: false,
  });

  try {
    const info = await youtube.getInfo(video_id);
    const transcriptData = await info.getTranscript();

    const segments: any =
      transcriptData?.transcript?.content?.body?.initial_segments.map(
        (segment: any) => ({
          start_ms: segment.start_ms,
          end_ms: segment.end_ms,
          snippet: segment.snippet?.text?.trim(),
          start_time_text: segment.start_time_text?.text,
          target_id: segment.target_id,
        }),
      );

    // Convert to seconds and group by 30-second intervals
    const groupedByInterval = segments.reduce(
      (
        acc: { startTime: number; endTime: number; text: any[] }[],
        segment: { start_ms: string; snippet: any },
      ) => {
        const startTime = parseInt(segment.start_ms, 10) / 1000;
        const intervalIndex = Math.floor(startTime / 30);

        if (!acc[intervalIndex]) {
          acc[intervalIndex] = {
            startTime: intervalIndex * 30,
            endTime: (intervalIndex + 1) * 30,
            text: [],
          };
        }

        acc[intervalIndex].text.push(segment.snippet);

        return acc;
      },
      [],
    );

    return Object.values(groupedByInterval).map((interval: any) => ({
      startTime: interval.startTime,
      endTime: interval.endTime,
      text: interval.text.join(" ").replace(/\s+/g, " "),
    }));
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw error;
  }
};
