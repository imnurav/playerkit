import type { SeekFeedbackOverlayProps } from "../types";
import { IconRewind, IconForward } from "@playerkit/ui";
import { memo } from "react";

export const SeekFeedbackOverlay = memo(function SeekFeedbackOverlay(
  props: SeekFeedbackOverlayProps,
) {
  const { feedback, isMobilePortrait = false } = props;
  if (!feedback) return null;

  const className = [
    "pk-seek-feedback",
    `pk-seek-feedback--${feedback.side}`,
    isMobilePortrait && "pk-seek-feedback--portrait",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} key={feedback.id}>
      {feedback.side === "left" ? <IconRewind /> : <IconForward />}
      <span>
        {feedback.side === "left" ? "-" : "+"}
        {feedback.seconds}
      </span>
    </div>
  );
});

SeekFeedbackOverlay.displayName = "SeekFeedbackOverlay";
