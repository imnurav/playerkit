import type { CenterPlayFeedbackProps } from "../types";
import { IconPlay, IconPause } from "@nurav/player-ui";
import { memo } from "react";

export const CenterPlayFeedback = memo(function CenterPlayFeedback(
  props: CenterPlayFeedbackProps,
) {
  const { feedback } = props;
  if (!feedback) return null;

  return (
    <div className="vp-center-action" key={feedback.id}>
      {feedback.action === "play" ? <IconPlay /> : <IconPause />}
    </div>
  );
});

CenterPlayFeedback.displayName = "CenterPlayFeedback";
