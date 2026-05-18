import Hls from "hls.js";

export function createHls(video: HTMLVideoElement, src: string) {
  if (Hls.isSupported()) {
    const hls = new Hls();

    hls.loadSource(src);
    hls.attachMedia(video);

    return hls;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
  }

  return null;
}
