import type { BufferedRange } from "../types/player.types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function isFiniteNumber(value: number) {
  return Number.isFinite(value) && !Number.isNaN(value);
}

export function getMediaDuration(video: HTMLVideoElement) {
  return isFiniteNumber(video.duration) ? video.duration : 0;
}

export function getQualityLabel(height: number, bitrate: number) {
  if (height > 0) {
    return `${height}p`;
  }

  if (bitrate > 0) {
    return `${Math.round(bitrate / 1000)} kbps`;
  }

  return "Unknown";
}

export function getBufferedRanges(video: HTMLVideoElement): BufferedRange[] {
  return Array.from({ length: video.buffered.length }, (_, index) => ({
    start: video.buffered.start(index),
    end: video.buffered.end(index),
  }));
}

export function getBufferedEnd(video: HTMLVideoElement) {
  const ranges = getBufferedRanges(video);

  if (ranges.length === 0) {
    return 0;
  }

  return ranges[ranges.length - 1].end;
}

export function getBufferedPercent(video: HTMLVideoElement) {
  const duration = getMediaDuration(video);

  if (duration <= 0) {
    return 0;
  }

  return clamp((getBufferedEnd(video) / duration) * 100, 0, 100);
}

// ─── Live stream helpers ─────────────────────────────────────────────────────

/**
 * Get the live edge position from the video's seekable range.
 * Returns 0 for VOD or if no seekable range is available.
 */
export function getLiveEdge(video: HTMLVideoElement): number {
  if (video.seekable.length === 0) {
    return 0;
  }

  return video.seekable.end(video.seekable.length - 1);
}

/**
 * Get the start of the seekable range (for DVR calculations).
 */
export function getSeekableStart(video: HTMLVideoElement): number {
  if (video.seekable.length === 0) {
    return 0;
  }

  return video.seekable.start(0);
}

/**
 * Check whether the current playback position is within `threshold`
 * seconds of the live edge.
 */
export function isWithinLiveEdge(
  video: HTMLVideoElement,
  threshold: number,
): boolean {
  const liveEdge = getLiveEdge(video);

  if (liveEdge === 0) {
    return false;
  }

  return liveEdge - video.currentTime <= threshold;
}

/**
 * Calculate the latency (seconds) between current playback and the live edge.
 */
export function getLiveLatency(video: HTMLVideoElement): number {
  const liveEdge = getLiveEdge(video);

  if (liveEdge === 0) {
    return 0;
  }

  return Math.max(0, liveEdge - video.currentTime);
}
