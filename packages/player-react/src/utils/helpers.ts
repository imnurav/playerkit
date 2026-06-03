import type { PlayerSnapshot } from "@nurav/player-core";
import { isYoutubeUrl } from "@nurav/player-core";

/**
 * Calculates the current progress percentage of a VOD or Live HLS stream.
 */
export function calculateProgress(state: PlayerSnapshot | null): number {
  if (!state) return 0;
  if (state.isLive) {
    if (state.dvr && state.seekableEnd > state.seekableStart) {
      const range = state.seekableEnd - state.seekableStart;
      if (range <= 0) return 100;
      return Math.min(
        ((state.currentTime - state.seekableStart) / range) * 100,
        100,
      );
    }
    return 100; // Force 100% fill for non-DVR live streams
  }
  if (!state.duration) return 0;
  return Math.min((state.currentTime / state.duration) * 100, 100);
}

/**
 * Calculates the buffered timeline percentage of a VOD or Live HLS stream.
 */
export function calculateBuffered(state: PlayerSnapshot | null): number {
  if (!state) return 0;
  if (state.isLive) {
    if (state.dvr && state.seekableEnd > state.seekableStart) {
      const range = state.seekableEnd - state.seekableStart;
      if (range <= 0) return 0;
      return Math.min(
        ((state.bufferedEnd - state.seekableStart) / range) * 100,
        100,
      );
    }
    return 100; // Force 100% buffer fill for non-DVR live streams
  }
  return state.bufferedPercent || 0;
}

/**
 * Dynamically determines which player format to load (HLS vs YouTube).
 * Prioritizes explicit URL matches (VOD/Live stream URL vs YouTube URL/ID),
 * and falls back to the manual type prop if provided and URL is generic/ambiguous.
 */
export function determinePlayerType(
  src?: string,
  manualType?: "hls" | "youtube",
): "hls" | "youtube" {
  const url = (src || "").trim();

  // 1. Prioritize explicit YouTube URLs or 11-char Video IDs
  const isYt = isYoutubeUrl(url) || /^[a-zA-Z0-9_-]{11}$/.test(url);
  if (isYt) return "youtube";

  // 2. Prioritize explicit HLS (.m3u8) URLs
  const isHls = url.toLowerCase().includes(".m3u8");
  if (isHls) return "hls";

  // 3. Fall back to the manual type prop if specified
  if (manualType === "youtube" || manualType === "hls") {
    return manualType;
  }

  // 4. Default baseline fallback
  return "hls";
}
