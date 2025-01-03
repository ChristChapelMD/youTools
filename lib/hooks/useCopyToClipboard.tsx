import { useState } from "react";

export function useCopyToClipboard() {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyClick = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return { copySuccess, handleCopyClick };
}
