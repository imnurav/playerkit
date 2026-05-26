import type { BufferedRange } from "../types/player.types";

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Get video duration, returning 0 for live streams (Infinity/NaN). */
export function getMediaDuration(video: HTMLVideoElement) {
  return Number.isFinite(video.duration) ? video.duration : 0;
}

/** Get all buffered time ranges from the video element. */
export function getBufferedRanges(video: HTMLVideoElement): BufferedRange[] {
  return Array.from({ length: video.buffered.length }, (_, i) => ({
    start: video.buffered.start(i),
    end: video.buffered.end(i),
  }));
}

/** Get the furthest buffered position (seconds). */
export function getBufferedEnd(video: HTMLVideoElement): number {
  for (let i = video.buffered.length - 1; i >= 0; i--) {
    const end = video.buffered.end(i);
    if (end > 0) return end;
  }
  return 0;
}

/** Get buffered percentage (0–100). */
export function getBufferedPercent(video: HTMLVideoElement): number {
  const duration = getMediaDuration(video);
  if (duration <= 0) return 0;
  return clamp((getBufferedEnd(video) / duration) * 100, 0, 100);
}

/** Get the live edge position from the video's seekable range. Returns 0 for VOD. */
export function getLiveEdge(video: HTMLVideoElement): number {
  return video.seekable.length > 0
    ? video.seekable.end(video.seekable.length - 1)
    : 0;
}

/** Get start of seekable range (for live DVR window). */
export function getSeekableStart(video: HTMLVideoElement): number {
  return video.seekable.length > 0 ? video.seekable.start(0) : 0;
}

/** Calculate seconds behind the live edge. */
export function getLiveLatency(video: HTMLVideoElement): number {
  const edge = getLiveEdge(video);
  return edge > 0 ? Math.max(0, edge - video.currentTime) : 0;
}
