import { calculateProgress, calculateBuffered } from "../utils/helpers";
import type { PlayerSnapshot } from "@nurav/player-core";
import { useMemo } from "react";

export function usePlayerTimeline(state: PlayerSnapshot | null) {
  const progress = useMemo(() => {
    return calculateProgress(state);
  }, [
    state?.currentTime,
    state?.duration,
    state?.isLive,
    state?.seekableStart,
    state?.seekableEnd,
  ]);

  const buffered = useMemo(() => {
    return calculateBuffered(state);
  }, [
    state?.bufferedPercent,
    state?.bufferedEnd,
    state?.isLive,
    state?.seekableStart,
    state?.seekableEnd,
  ]);

  return { progress, buffered };
}
