import { IconPlay, IconPause } from "@nurav/player-ui";
import { memo } from "react";

export type CenterPlayFeedbackType = {
  id: number;
  action: "play" | "pause";
};

export type CenterPlayFeedbackProps = {
  feedback: CenterPlayFeedbackType | null;
};

export const CenterPlayFeedback = memo(function CenterPlayFeedback({
  feedback,
}: CenterPlayFeedbackProps) {
  if (!feedback) return null;

  return (
    <div className="vp-center-action" key={feedback.id}>
      {feedback.action === "play" ? <IconPlay /> : <IconPause />}
    </div>
  );
});
