import Hls, { type HlsConfig } from "hls.js";

/**
 * Create an hls.js instance. Returns null if hls.js is unavailable.
 *
 * @param config Optional HLS.js configurations.
 * @param force Bypass support checks for native overrides.
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

/** Load source URL into HLS.js instance and attach to target HTMLVideoElement. */
export function attachHlsSource(
  hls: Hls,
  video: HTMLVideoElement,
  src: string,
) {
  hls.loadSource(src);
  hls.attachMedia(video);
}
