import { calculateProgress, calculateBuffered } from "../utils/helpers";
import type { PlayerSnapshot } from "@playerkit/core";
import { useMemo } from "react";

export function usePlayerTimeline(state: PlayerSnapshot | null) {
  const progress = useMemo(() => {
    return calculateProgress(state);
  }, [
    state?.currentTime,
    state?.duration,
    state?.isLive,
    state?.dvr,
    state?.seekableStart,
    state?.seekableEnd,
  ]);

  const buffered = useMemo(() => {
    return calculateBuffered(state);
  }, [
    state?.bufferedPercent,
    state?.bufferedEnd,
    state?.isLive,
    state?.dvr,
    state?.seekableStart,
    state?.seekableEnd,
  ]);

  return { progress, buffered };
}
