import { Accordion, AccordionItem } from "@nextui-org/accordion";
import ReactMarkdown from "react-markdown";

import {
  Loader,
  ExternalLinkIcon,
  ShareIcon,
  LikeButtonIcon,
  NotificationIcon,
} from "./icons";

import { copyUrl } from "@/lib/helpers";
import { useCopyToClipboard } from "@/lib/hooks";

export type SummaryAccordionProps = {
  summary: any;
  loading: boolean;
  video_id: string;
  variant?: "light" | "bordered" | "shadow" | "splitted";
};

const SummaryAccordion = ({
  summary,
  loading,
  video_id,
  variant,
}: SummaryAccordionProps) => {
  const { copySuccess, handleCopyClick } = useCopyToClipboard();

  console.log(copySuccess);

  return (
    <Accordion
      className="mb-4 shadow-none"
      defaultValue="summary"
      variant={variant}
    >
      <AccordionItem title="Summary">
        {/* Accordion Content */}
        <div className="p-4 max-h-64 overflow-y-auto md:max-h-96">
          {loading ? (
            <div className="flex items-center justify-center animate-spin">
              <Loader />
            </div>
          ) : (
            <>
              {/* Actions */}
              <div className="mb-4 flex flex-row items-center gap-2">
          {/* Share Button */}
          <button
            aria-label="Copy URL"
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleCopyClick(copyUrl(video_id))}
          >
            <ShareIcon />
          </button>
          {/* External Link */}
          <a
            className="ml-2 text-blue-500 hover:text-blue-700"
            href={`https://www.youtube.com/watch?v=${video_id}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon />
          </a>
          {/* Need to replace with controlled like button */}
          <LikeButtonIcon />
              </div>
              {/* Summary Text */}
              <div>
          {summary ? (
            // eslint-disable-next-line
            <ReactMarkdown>{summary}</ReactMarkdown>
          ) : (
            "No summary available."
          )}
              </div>
              {/* Notification */}
            </>
          )}
          <NotificationIcon />
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default SummaryAccordion;
