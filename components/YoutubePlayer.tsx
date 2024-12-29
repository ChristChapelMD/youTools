"use client";

import React, { useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Skeleton } from "@nextui-org/skeleton";

import { useCheckMobile } from "@/lib/hooks";

interface YouTubePlayerProps {
  videoId: string;
  onReady: (player: any) => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onReady }) => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useCheckMobile();
  const opts: YouTubeProps["opts"] = {
    height: "162",
    width: "288",
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  };

  const handleReady: YouTubeProps["onReady"] = (event) => {
    setIsLoading(false);
    onReady(event.target);
  };

  return (
    <div
      style={{
        position: "relative",
        width: opts.width,
        height: opts.height,
        overflow: "hidden",
        display: "flex",
        margin: "0 auto",
        marginBottom: "1rem",
      }}
    >
      {isLoading && (
        <Skeleton
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: isMobile ? "360px" : "550px",
            height: isMobile ? "205px" : "335px",
          }}
        />
      )}
      <YouTube opts={opts} videoId={videoId} onReady={handleReady} />
    </div>
  );
};

export default YouTubePlayer;
