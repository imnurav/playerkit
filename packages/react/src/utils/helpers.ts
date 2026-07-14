import { isYoutubeUrl, isMp4Url } from "@playerkit/core";
import type { PlayerSnapshot } from "@playerkit/core";
import type { PlayerEngineType } from "../types";

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
 * Calculates the buffered timeline percentage or ranges of a VOD or Live HLS stream.
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
  
  if (!state.duration) return 0;
  
  const currentTime = state.currentTime;
  let activeBufferEnd = currentTime;
  
  // Find the continuous buffered chunk that contains the current playhead
  for (const range of state.buffered) {
    if (currentTime >= range.start - 0.2 && currentTime <= range.end + 0.2) {
      activeBufferEnd = range.end;
      break;
    }
  }
  
  return Math.min((activeBufferEnd / state.duration) * 100, 100);
}

/**
 * Dynamically determines which player engine to load (HLS / MP4 / YouTube).
 *
 * Resolution order:
 *  1. Explicit YouTube URLs or 11-char video IDs → "youtube"
 *  2. Explicit HLS (.m3u8) URLs → "hls"
 *  3. Explicit MP4 / WebM / OGG / M4V / data: / blob: URLs → "mp4"
 *  4. Manual type prop override (if specified)
 *  5. Default fallback → "hls" (most permissive native path)
 */
export function determinePlayerType(
  src?: string,
  manualType?: PlayerEngineType,
): PlayerEngineType {
  const url = (src || "").trim();

  // 1. Prioritize explicit YouTube URLs or 11-char Video IDs
  const isYt = isYoutubeUrl(url) || /^[a-zA-Z0-9_-]{11}$/.test(url);
  if (isYt) return "youtube";

  // 2. Prioritize explicit HLS (.m3u8) URLs
  const lower = url.toLowerCase().split(/[?#]/)[0]!;
  if (lower.endsWith(".m3u8")) return "hls";

  // 3. MP4-class progressive sources (.mp4, .m4v, .webm, .ogv, .ogg,
  //    data: URIs, blob: URLs) → "mp4"
  if (isMp4Url(url)) return "mp4";

  // 4. Fall back to the manual type prop if specified
  if (
    manualType === "youtube" ||
    manualType === "hls" ||
    manualType === "mp4"
  ) {
    return manualType;
  }

  // 5. Default baseline fallback
  return "hls";
}
