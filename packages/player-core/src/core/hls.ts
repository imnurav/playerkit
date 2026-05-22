import Hls, { type HlsConfig } from "hls.js";

export type HlsInstance = Hls;

/**
 * Create an HLS.js instance with optional config overrides.
 * Returns null if HLS.js is not supported (e.g. Safari uses native HLS).
 *
 * @param config - Optional HLS.js configuration overrides.
 * @param force  - Bypass Hls.isSupported() check. Use when auth headers
 *                 (xhrSetup) must be applied on every request. iOS native
 *                 HLS only respects cookies (not headers or URL params
 *                 on sub-requests), so hls.js must be forced on iOS.
 */
export function createHls(
  config?: Partial<HlsConfig>,
  force?: boolean,
): Hls | null {
  if (!force && !Hls.isSupported()) {
    return null;
  }

  try {
    return new Hls(config);
  } catch {
    // `new Hls()` can throw on some iOS versions where MediaSource
    // is available but restricted, or when MSE codecs are unsupported.
    // Return null so the caller can fall back to native HLS.
    return null;
  }
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
