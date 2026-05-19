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
