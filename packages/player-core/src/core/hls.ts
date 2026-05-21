import Hls, { type HlsConfig } from "hls.js";

export type HlsInstance = Hls;

/**
 * Create an HLS.js instance with optional config overrides.
 * Returns null if HLS.js is not supported (e.g. Safari uses native HLS).
 */
export function createHls(config?: Partial<HlsConfig>): Hls | null {
  if (!Hls.isSupported()) {
    return null;
  }

  return new Hls(config);
}

export function attachHlsSource(
  hls: HlsInstance,
  video: HTMLVideoElement,
  src: string,
) {
  hls.loadSource(src);
  hls.attachMedia(video);
}

export function canUseNativeHls(video: HTMLVideoElement) {
  return video.canPlayType("application/vnd.apple.mpegurl") !== "";
}
