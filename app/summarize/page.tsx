"use client";
import type { Selection } from "@react-types/shared";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@nextui-org/skeleton";

import TranscriptAccordion from "@/components/TranscriptAccordion";
import YouTubePlayer from "@/components/YoutubePlayer";
import SummaryAccordion from "@/components/SummaryAccordion";
import {
  extractVideoId,
  getTitle,
  getYouTubeURL,
  isValidYouTubeUrl,
} from "@/lib/helpers";
import { useUser } from "@/lib/hooks";
import { AppConfig } from "@/lib/constants";
export default function YoutubeSummarizerPage() {
  const searchParams = useSearchParams();
  const initialVideoId = searchParams.get("v") ?? "";
  const router = useRouter();
  const user = useUser();

  type VideoWithSummary = {
    id: number;
    video_id: string;
    title: string | null;
    summary: string;
    endTime: string;
    videoLength?: string;
    datePosted: string;
  };

  const [url, setUrl] = useState(() =>
    initialVideoId ? getYouTubeURL({ video_id: initialVideoId }) : "",
  );
  const [video_id, setVideoId] = useState(initialVideoId);
  const [prevVideos, setPrevVideos] = useState<VideoWithSummary[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [embedUrl, setEmbedUrl] = useState(
    initialVideoId
      ? getYouTubeURL({ video_id: initialVideoId, embed: true })
      : "",
  );

  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState<boolean | undefined>(
    undefined,
  );
  const [saveHistory, setSaveHistory] = useState<boolean | undefined>(
    undefined,
  );
  const [thumbnailTitle, setThumbnailTitle] = useState("");
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(["0"]));
  const [videoLength, setVideoLength] = useState<string | null>(null);
  const [debouncedUrl, setDebouncedUrl] = useState<string>("");

  const handlePlayerTimeUpdate = () => {
    if (player) {
      setCurrentTime(player.getCurrentTime());
    }
  };

  useEffect(() => {
    async function loadVideos() {
      try {
        const response = await fetch(
          `/api/fetchPrevVideoData?video_id=${video_id}`,
        );
        const data = await response.json();

        setPrevVideos(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(url);
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  useEffect(() => {
    if (player) {
      const interval = setInterval(handlePlayerTimeUpdate, 3000); // Poll every second

      return () => clearInterval(interval);
    }
  }, [player]);

  const handlePlayerReady = (ytPlayer: any) => {
    setPlayer(ytPlayer);
  };

  const handleSeek = (seconds: number) => {
    if (player) {
      player.seekTo(seconds, true);
    }
  };

  useEffect(() => {
    const showExamplesStored = localStorage.getItem("showExamples");
    const saveHistoryStored = localStorage.getItem("saveHistory");

    setShowExamples(showExamplesStored ? JSON.parse(showExamplesStored) : true);
    setSaveHistory(saveHistoryStored ? JSON.parse(saveHistoryStored) : false);
  }, []);

  useEffect(() => {
    if (typeof showExamples === "boolean") {
      localStorage.setItem("showExamples", JSON.stringify(showExamples));
    }
    if (typeof saveHistory === "boolean") {
      localStorage.setItem("saveHistory", JSON.stringify(saveHistory));
    }
  }, [showExamples, saveHistory]);

  useEffect(() => {
    if (!video_id) return;
    const url = getYouTubeURL({
      video_id,
    });

    if (isValidYouTubeUrl(url)) {
      fetchEmbed(video_id);

      getTitle(url).then((title) => {
        setThumbnailTitle(title);
      });

      const params = new URLSearchParams();

      params.set("v", video_id);
      router.push(`?${params.toString()}`);

      handleSummarize(video_id);
    }
  }, [video_id]);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const videoURL = event.target.value;

    setUrl(videoURL);

    const extractedVideoId = extractVideoId(videoURL) as string;

    setVideoId(extractedVideoId);

    if (isValidYouTubeUrl(videoURL)) {
      fetchEmbed(extractedVideoId);
      const title = await getTitle(videoURL);

      setThumbnailTitle(title);
    } else {
      setEmbedUrl("");
      setThumbnailTitle("");
    }
  };

  const fetchEmbed = (video_id: string) => {
    const embed = getYouTubeURL({
      video_id,
      embed: true,
    });

    setEmbedUrl(embed);
  };

  const handleSummarize = async (video_id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${AppConfig.SITE_MAP.API.SUMMARIZE}?video_id=${encodeURIComponent(video_id)}&save=true`,
      );
      const summary = await response.json();

      setSummary(summary);
    } catch (error) {
      console.error("Error processing summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col py-4 sm:py-12">
      <h1 className="text-center text-4xl font-bold my-8">
        YouTube Video Summarizer
      </h1>
      <section className="flex flex-col items-center my-4">
        <Input
          required
          className="w-3/4 mb-4"
          pattern="https?://(www\.)?youtube\.com/watch\?v=.*"
          placeholder="Enter YouTube Video Link..."
          title="Please enter a valid YouTube video link"
          value={url}
          onChange={handleInputChange}
        />
        <Button className="mt-4" radius="full" size="lg">
          Summarize
        </Button>
      </section>
      <section className="">
        <Card
          className="w-full flex flex-col md:flex-row h-auto py-8"
          shadow="sm"
        >
          <div className="flex flex-col md:flex-row justify-center align-middle max-w-96 mx-auto mb-4 mt-8 ml-4">
            <YouTubePlayer videoId={video_id} onReady={handlePlayerReady} />
          </div>
          <div className="flex flex-col w-full md:p-8">
            <SummaryAccordion
              loading={loading}
              summary={summary}
              variant="splitted"
              video_id={video_id}
            />
            <TranscriptAccordion
              currentTime={currentTime}
              setVideoLength={setVideoLength}
              thumbnailTitle={thumbnailTitle}
              variant="splitted"
              videoId={video_id}
              onSeek={handleSeek}
            />
          </div>
        </Card>
      </section>
      <Divider className="my-8" />
      <section className="mt-8 flex flex-col justify-evenly">
        <h2 className="text-center text-4xl font-bold my-8">
          Previous Summaries
        </h2>
        <Accordion
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                height: "auto",
                overflowY: "unset",
                transition: {
                  height: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    duration: 1,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 1,
                  },
                },
              },
              exit: {
                y: -10,
                opacity: 0,
                height: 0,
                overflowY: "hidden",
                transition: {
                  height: {
                    easings: "ease",
                    duration: 0.25,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 0.3,
                  },
                },
              },
            },
          }}
          selectedKeys={selectedKeys}
          variant="shadow"
          onSelectionChange={setSelectedKeys}
        >
          {loading
            ? Array.from({ length: 3 }).map((_) => (
                <AccordionItem key={`skeleton-${crypto.randomUUID()}`}>
                  <Skeleton className="h-52 w-full" />
                  <Skeleton className="h-2 w-1/2" />
                </AccordionItem>
              ))
            : prevVideos.map((video) => (
                <AccordionItem
                  key={video.video_id}
                  aria-label={`Accordion for video ${video.video_id}`}
                  startContent={
                    Array.from(selectedKeys).includes(
                      video.video_id,
                    ) ? undefined : (
                      <Image
                        removeWrapper
                        alt={`${video.title} thumbnail`}
                        className="z-0 w-16 h-16 object-cover"
                        src={`https://img.youtube.com/vi/${video.video_id}/0.jpg`}
                      />
                    )
                  }
                  subtitle={`${
                    video.datePosted
                      ? new Date(video.datePosted).toLocaleDateString()
                      : "Unknown Date"
                  } | ${video.videoLength ?? "00:00:00"}`}
                  title={video.title ?? "Untitled Video"}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="flex flex-col md:flex-row justify-center align-middle max-w-96 mx-auto mb-4 ml-4">
                      <YouTubePlayer
                        videoId={video.video_id}
                        onReady={handlePlayerReady}
                      />
                    </div>
                    <div className="flex flex-col w-full md:p-8">
                      <SummaryAccordion
                        loading={loading}
                        summary={video.summary}
                        variant="splitted"
                        video_id={video.video_id}
                      />
                      <TranscriptAccordion
                        currentTime={currentTime}
                        setVideoLength={(length) => {
                          const updatedVideos = prevVideos.map((v) =>
                            v.video_id === video.video_id
                              ? { ...v, videoLength: length ?? undefined }
                              : v,
                          );

                          setPrevVideos(updatedVideos); // Assuming you're managing state for `prevVideos`
                        }}
                        thumbnailTitle={video.title ?? "Untitled Video"}
                        variant="splitted"
                        videoId={video.video_id}
                        onSeek={handleSeek}
                      />
                    </div>
                  </div>
                </AccordionItem>
              ))}
        </Accordion>
      </section>
      <Suspense fallback={null} />
    </main>
  );
}
