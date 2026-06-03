import { IconRewind, IconForward } from "@nurav/player-ui";
import type { SeekFeedbackOverlayProps } from "../types";
import { memo } from "react";

export const SeekFeedbackOverlay = memo(function SeekFeedbackOverlay(
  props: SeekFeedbackOverlayProps,
) {
  const { feedback } = props;
  if (!feedback) return null;

  return (
    <div
      className={`vp-seek-feedback vp-seek-feedback--${feedback.side}`}
      key={feedback.id}
    >
      {feedback.side === "left" ? <IconRewind /> : <IconForward />}
      <span>
        {feedback.side === "left" ? "-" : "+"}
        {feedback.seconds}
      </span>
    </div>
  );
});

SeekFeedbackOverlay.displayName = "SeekFeedbackOverlay";
