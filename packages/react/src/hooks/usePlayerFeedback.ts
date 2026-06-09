import type { CenterPlayFeedbackType, SeekFeedbackType } from "../types";
import { useState, useCallback } from "react";
import {
  SEEK_FEEDBACK_DURATION,
  CENTER_PLAY_FEEDBACK_DURATION,
} from "../constants";

/**
 * Reusable hook to handle player seek and center play overlay timer states and callbacks.
 */
export function usePlayerFeedback() {
  const [seekFeedback, setSeekFeedback] = useState<SeekFeedbackType | null>(
    null,
  );
  const [centerPlayFeedback, setCenterPlayFeedback] =
    useState<CenterPlayFeedbackType | null>(null);

  const showSeekFeedback = useCallback(
    (side: "left" | "right", seconds: number) => {
      const feedback: SeekFeedbackType = { side, id: Date.now(), seconds };
      setSeekFeedback(feedback);
      window.setTimeout(() => {
        setSeekFeedback((current: SeekFeedbackType | null) =>
          current?.id === feedback.id ? null : current,
        );
      }, SEEK_FEEDBACK_DURATION);
    },
    [],
  );

  const showCenterPlayFeedback = useCallback((action: "play" | "pause") => {
    const feedback: CenterPlayFeedbackType = { id: Date.now(), action };
    setCenterPlayFeedback(feedback);
    window.setTimeout(() => {
      setCenterPlayFeedback((current: CenterPlayFeedbackType | null) =>
        current?.id === feedback.id ? null : current,
      );
    }, CENTER_PLAY_FEEDBACK_DURATION);
  }, []);

  return {
    seekFeedback,
    centerPlayFeedback,
    showSeekFeedback,
    showCenterPlayFeedback,
  };
}
