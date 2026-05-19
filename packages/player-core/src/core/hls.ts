import Hls from "hls.js";

export type HlsInstance = Hls;

export function createHls() {
  return Hls.isSupported() ? new Hls() : null;
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
