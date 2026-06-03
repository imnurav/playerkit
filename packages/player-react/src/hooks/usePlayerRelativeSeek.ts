import type { UsePlayerRelativeSeekOptions } from "../types";
import { useRef, useEffect, useCallback } from "react";

/**
 * Reusable high-performance hook to handle accumulated relative seeking (backward/forward).
 * Limits repeated rapid seek operations to run as a single accumulated relative seek,
 * providing responsive seeker UI feedback.
 */
export function usePlayerRelativeSeek({
  player,
  seekStep,
  showSeekFeedback,
}: UsePlayerRelativeSeekOptions) {
  const seekAccumulatedRef = useRef<{
    direction: -1 | 1;
    count: number;
    timer: number | null;
  }>({
    direction: 1,
    count: 0,
    timer: null,
  });

  // Clean up seek accumulation timer on unmount
  useEffect(() => {
    return () => {
      const acc = seekAccumulatedRef.current;
      if (acc.timer) clearTimeout(acc.timer);
    };
  }, []);

  const seekRelative = useCallback(
    (direction: -1 | 1) => {
      if (!player) return;
      const activeState = player.getState();
      if (activeState.isLive && !activeState.dvr) return;

      const acc = seekAccumulatedRef.current;
      if (acc.direction !== direction) {
        acc.count = 0;
      }
      acc.direction = direction;
      if (acc.timer) clearTimeout(acc.timer);
      acc.count += 1;
      const totalSeconds = seekStep * acc.count;
      player.seek(activeState.currentTime + direction * totalSeconds);
      showSeekFeedback(direction === -1 ? "left" : "right", totalSeconds);
      acc.timer = window.setTimeout(() => {
        acc.count = 0;
        acc.timer = null;
      }, 800);
    },
    [player, seekStep, showSeekFeedback],
  );

  return { seekRelative };
}
