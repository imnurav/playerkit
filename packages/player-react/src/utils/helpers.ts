import type { PlayerSnapshot } from "@varun/player-core";

/**
 * Calculates the current progress percentage of a VOD or Live HLS stream.
 */
export function calculateProgress(state: PlayerSnapshot | null): number {
  if (!state) return 0;
  if (state.isLive && state.seekableEnd > state.seekableStart) {
    const range = state.seekableEnd - state.seekableStart;
    if (range <= 0) return 100;
    return Math.min(
      ((state.currentTime - state.seekableStart) / range) * 100,
      100,
    );
  }
  if (!state.duration) return 0;
  return Math.min((state.currentTime / state.duration) * 100, 100);
}

/**
 * Calculates the buffered timeline percentage of a VOD or Live HLS stream.
 */
export function calculateBuffered(state: PlayerSnapshot | null): number {
  if (!state) return 0;
  if (state.isLive && state.seekableEnd > state.seekableStart) {
    const range = state.seekableEnd - state.seekableStart;
    if (range <= 0) return 0;
    return Math.min(
      ((state.bufferedEnd - state.seekableStart) / range) * 100,
      100,
    );
  }
  return state.bufferedPercent || 0;
}
