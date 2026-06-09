import type { ErrorManager } from "../shared/error-manager";
import { logger } from "../utils/logger";

/**
 * Mp4Manager — handles the native HTML5 <video> element source lifecycle
 * for progressive MP4 (and other natively-supported container) sources.
 *
 * Unlike HlsManager, there is no adaptive-bitrate engine, no manifest, and
 * no segment loader — the browser handles playback entirely. The manager's
 * job is to:
 *   1. Assign the URL to the <video> element and trigger a load.
 *   2. Forward native error events to the central ErrorManager.
 *   3. Provide retry semantics identical to the HLS path.
 *
 * The MP4 path is essentially the "native fallback" that the HLS Player
 * already uses for browsers without hls.js support — extracted into its
 * own module so it can also be used standalone.
 */
export class Mp4Manager {
  private video: HTMLVideoElement;
  private errorManager: ErrorManager;
  private currentSrc: string | null = null;
  private listeners: Array<() => void> = [];

  constructor(video: HTMLVideoElement, errorManager: ErrorManager) {
    this.video = video;
    this.errorManager = errorManager;
  }

  /**
   * Load an MP4 (or other natively-supported) source into the video element.
   * Returns the final URL that was assigned to the element.
   */
  load(src: string): string {
    this.cleanup();
    this.currentSrc = src;

    logger.debug(`[Mp4Manager] Loading source: ${src}`);

    // Setting src + calling load() forces the element to begin fetching.
    this.video.src = src;
    this.video.load();

    // The native `error` event is the only failure channel for progressive MP4.
    // HLS has rich error classification; for MP4 we defer to the central
    // ErrorManager which knows how to format MediaError objects.
    const onError = () => {
      this.errorManager.raise(
        this.errorManager.mediaElementError(this.video.error),
      );
    };
    this.video.addEventListener("error", onError);
    this.listeners.push(() => this.video.removeEventListener("error", onError));

    return src;
  }

  /** Update only the source URL without recreating listeners. */
  updateSrc(src: string) {
    if (this.currentSrc === src) return;
    this.currentSrc = src;
    this.video.src = src;
    this.video.load();
  }

  /** Get the currently loaded source URL (post-auth, if any). */
  getCurrentSrc(): string | null {
    return this.currentSrc;
  }

  /** Reset internal state without destroying the manager. */
  reset() {
    this.cleanup();
    this.currentSrc = null;
  }

  destroy() {
    this.cleanup();
    this.currentSrc = null;
  }

  private cleanup() {
    this.listeners.forEach((off) => off());
    this.listeners = [];
  }
}
