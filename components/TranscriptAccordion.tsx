"use client";

import React, { useEffect, useRef, useState } from "react";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Skeleton } from "@nextui-org/skeleton";
import { Switch } from "@nextui-org/switch";

import { DownloadIcon } from "./icons";

import { formatTime } from "@/lib/helpers";

interface Timestamp {
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptAccordionProps {
  videoId: string;
  onSeek: (time: number) => void;
  currentTime: number;
  thumbnailTitle: string;
  setVideoLength?: (length: string | null) => void;
  variant?: "light" | "bordered" | "shadow" | "splitted";
}

const TranscriptAccordion: React.FC<TranscriptAccordionProps> = ({
  videoId,
  onSeek,
  currentTime,
  thumbnailTitle,
  setVideoLength,
  variant = "light",
}) => {
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const activeRef = useRef<HTMLDivElement | null>(null);

  const fetchTimestamps = async (video_id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/get-timestamps?video_id=${encodeURIComponent(video_id)}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch timestamps: ${response.statusText}`);
      }
      const data = await response.json();

      const intervals = data.intervals || [];

      if (intervals.length > 0 && setVideoLength) {
        setVideoLength(formatTime(intervals[intervals.length - 1].endTime));
      }

      setTimestamps(data.intervals || []);
    } catch (err) {
      setError((err as Error).message || "Failed to load timestamps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) fetchTimestamps(videoId);
  }, [videoId]);

  useEffect(() => {
    if (isAutoScrollEnabled && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentTime, isAutoScrollEnabled]);

  const getActiveTimestamp = () => {
    return timestamps.find(
      (timestamp) =>
        currentTime >= timestamp.startTime && currentTime < timestamp.endTime,
    );
  };

  const downloadTimestampsAsTxt = () => {
    const header = `Transcript with timestamps for ${thumbnailTitle}\n\nyou.tools/summarize/?v=${videoId}\n\n`;
    const content = timestamps
      .map(
        (timestamp) =>
          `[${formatTime(timestamp.startTime)} - ${formatTime(
            timestamp.endTime,
          )}]\n${timestamp.text}`,
      )
      .join("\n\n");

    const finalContent = header + content;

    const blob = new Blob([finalContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `Transcitpt with timestamps - ${thumbnailTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeTimestamp = getActiveTimestamp();

  const isTranscriptUnavailable = timestamps.every(
    (timestamp) => timestamp.text.trim() === "",
  );

  return (
    <Accordion defaultValue="timestamps" variant={variant} className="mb-4">
      <AccordionItem title="Transcript" value="transcript">
        <div className="flex items-center justify-between">
          <button
            className="text-sm font-medium hover:underline"
            onClick={() => {
              if (activeRef.current) {
                activeRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            }}
          >
            Auto-Scroll
          </button>
          <Switch
            isSelected={isAutoScrollEnabled}
            onValueChange={setIsAutoScrollEnabled}
          />
        </div>
        {/* Content */}
        <div className="relative max-h-64 overflow-y-auto md:max-h-96">
          {loading ? (
            <>
              <Skeleton className="mb-4 h-3 w-full" />
              <Skeleton className="mb-4 h-3 w-full" />
              <Skeleton className="mb-4 h-3 w-full" />
            </>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : timestamps.length === 0 ? (
            <div className="text-gray-500">No timestamps available.</div>
          ) : isTranscriptUnavailable ? (
            <div className="text-gray-500">
              Transcript Unavailable for This Video.
            </div>
          ) : (
            <div className="relative">
              {/* Sticky Auto-Scroll Toggle */}
              <div className="-top-4 z-10 p-1 shadow" />

              {/* Download Button */}
              <div className="hidden py-1 md:block">
                <button onClick={downloadTimestampsAsTxt}>
                  <DownloadIcon className="w-6 h-6 mr-2" />
                </button>
              </div>

              {/* Timestamps List */}
              {timestamps.map((timestamp, index) => (
                <div
                  key={index}
                  ref={
                    activeTimestamp === timestamp
                      ? (ref) => {
                          activeRef.current = ref;
                        }
                      : null
                  }
                  className={`mb-4 rounded p-2 ${
                    activeTimestamp === timestamp
                      ? "border-2"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <button
                    className="cursor-pointer font-semibold text-blue-600 hover:underline"
                    onClick={() => onSeek(timestamp.startTime)}
                  >
                    {formatTime(timestamp.startTime)} -{" "}
                    {formatTime(timestamp.endTime)}
                  </button>
                  <p className="text-sm text-gray-700">{timestamp.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default TranscriptAccordion;
