import Hls, { type HlsConfig } from "hls.js";

export type HlsInstance = Hls;

/**
 * Create an hls.js instance. Returns null if hls.js is unavailable
 * (e.g. Safari without forced mode) so the caller can fall back to native HLS.
 *
 * @param force - Bypass `Hls.isSupported()`. Used when auth headers must
 *   apply to every sub-request, which native HLS on iOS does not support.
 */
export function createHls(
  config?: Partial<HlsConfig>,
  force?: boolean,
): Hls | null {
  if (!force && !Hls.isSupported()) return null;
  try {
    return new Hls(config);
  } catch {
    return null;
  }
}

/** Load a source URL into an hls.js instance and attach it to a video element. */
export function attachHlsSource(
  hls: HlsInstance,
  video: HTMLVideoElement,
  src: string,
) {
  hls.loadSource(src);
  hls.attachMedia(video);
}
