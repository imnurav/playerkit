import { IconRewind, IconForward } from "@nurav/player-ui";
import { memo } from "react";

export type SeekFeedbackType = {
  side: "left" | "right";
  id: number;
  seconds: number;
};

export type SeekFeedbackOverlayProps = {
  feedback: SeekFeedbackType | null;
};

export const SeekFeedbackOverlay = memo(function SeekFeedbackOverlay({
  feedback,
}: SeekFeedbackOverlayProps) {
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
