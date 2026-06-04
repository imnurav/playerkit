import type { YouTubeIFramePlayer } from "../types/youtube.types";
import { YouTubePlayerState } from "../types/youtube.types";
import { logger } from "../utils/logger";

/**
 * Global YouTube IFrame API ready state.
 * Set to true once onYouTubeIframeAPIReady fires.
 */
let apiReady = false;
let apiLoading = false;
const readyCallbacks: Array<() => void> = [];

/**
 * Load the YouTube IFrame API script dynamically.
 * Ensures it's only loaded once.
 */
function loadYouTubeApi(): Promise<void> {
  if (apiReady) {
    logger.debug("[YoutubeManager] API already ready");
    return Promise.resolve();
  }
  if (apiLoading) {
    logger.debug("[YoutubeManager] API loading, queuing");
    return new Promise((resolve) => readyCallbacks.push(resolve));
  }

  apiLoading = true;
  return new Promise((resolve) => {
    // Define the global callback that YouTube calls when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      logger.info("[YoutubeManager] onYouTubeIframeAPIReady fired");
      apiReady = true;
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
      resolve();
    };

    // Create and inject the script tag
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);
    logger.info("[YoutubeManager] Script tag injected");
  });
}

/**
 * YouTubeManager — handles the YouTube IFrame Player API lifecycle:
 * loading the API script, creating/destroying the player, and bridging
 * YouTube events to our player event callbacks.
 */
export class YoutubeManager {
  private playerId: string;
  private pendingPlay = false;
  private isDestroyed = false;
  private pendingPause = false;
  private iframeContainer: HTMLElement;
  private pendingSeek: number | null = null;
  private player: YouTubeIFramePlayer | null = null;

  /** Callbacks registered by YoutubePlayer */
  private onReady: () => void;
  private onError: (errorCode: number) => void;
  private onStateChange: (state: YouTubePlayerState) => void;
  private onCurrentTimeUpdate: (currentTime: number) => void;

  // Polling for time updates
  private timePollingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    container: HTMLElement,
    callbacks: {
      onReady: () => void;
      onError: (errorCode: number) => void;
      onStateChange: (state: YouTubePlayerState) => void;
      onCurrentTimeUpdate: (currentTime: number) => void;
    },
  ) {
    this.iframeContainer = container;
    this.playerId = `youtube-player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.onReady = callbacks.onReady;
    this.onStateChange = callbacks.onStateChange;
    this.onError = callbacks.onError;
    this.onCurrentTimeUpdate = callbacks.onCurrentTimeUpdate;
    logger.info("[YoutubeManager] constructed, playerId:", this.playerId);
  }

  /**
   * Load a YouTube video by ID.
   * Returns the IFrame Player once ready, or null if destroyed.
   */
  async load(
    videoId: string,
    autoPlay?: boolean,
    startTime?: number,
  ): Promise<YouTubeIFramePlayer | null> {
    logger.info("[YoutubeManager] load() called for videoId:", videoId);

    await loadYouTubeApi();
    if (this.isDestroyed) {
      logger.info("[YoutubeManager] destroyed during API load");
      return null;
    }

    const YT = (window as any).YT;
    if (!YT || !YT.Player) {
      logger.error(
        "[YoutubeManager] YT.Player not available even after API load!",
      );
      this.onError(5);
      return null;
    }

    const wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("data-yt-wrapper", "");
    Object.assign(wrapperDiv.style, {
      top: "0",
      left: "0",
      width: "100%",
      opacity: "0",
      height: "100%",
      position: "absolute",
      background: "transparent",
      overflow: "hidden", // clips the 400%-tall iframe
      pointerEvents: "none", // let our custom controls handle all input
    });
    this.iframeContainer.appendChild(wrapperDiv);

    const targetDiv = document.createElement("div");
    targetDiv.id = this.playerId;
    Object.assign(targetDiv.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
    });
    wrapperDiv.appendChild(targetDiv);

    logger.info(
      "[YoutubeManager] wrapper+target appended to DOM, id:",
      this.playerId,
    );

    const playerVars: Record<string, any> = {
      fs: 0,
      rel: 0,
      controls: 1,
      showinfo: 0,
      disablekb: 1,
      playsinline: 1,
      enablejsapi: 1,
      modestbranding: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
    };

    if (autoPlay) playerVars["autoplay"] = 1;
    if (startTime) playerVars["start"] = Math.floor(startTime);

    logger.info("[YoutubeManager] Creating YT.Player with id:", this.playerId);

    return new Promise<YouTubeIFramePlayer | null>((resolve) => {
      let resolved = false;

      try {
        const player = new YT.Player(this.playerId, {
          videoId,
          playerVars,
          width: "100%",
          height: "100%",
          events: {
            onReady: (event: any) => {
              logger.info(
                "[YouTube API Native Event] onReady fired with event:",
                event,
              );
              if (resolved) return;
              if (this.isDestroyed) {
                logger.info("[YoutubeManager] destroyed before onReady");
                if (event.target) {
                  try {
                    event.target.destroy();
                  } catch {}
                } else {
                  player.destroy();
                }
                resolve(null);
                return;
              }
              this.player = event.target || player;
              resolved = true;

              const iframe = wrapperDiv.querySelector("iframe");
              if (iframe) {
                Object.assign(iframe.style, {
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  width: "100%",
                  height: "400%",
                  transform: "translateY(-50%)",
                  border: "none",
                  pointerEvents: "none",
                });
              }

              wrapperDiv.style.transition = "opacity 250ms ease";
              wrapperDiv.style.opacity = "1";

              try {
                const nativePlayer = event.target || player;
                const state = nativePlayer.getPlayerState();
                logger.info(
                  "[YouTube API Native Event] onReady - player.getPlayerState():",
                  state,
                );
                const dur = nativePlayer.getDuration();
                logger.info(
                  "[YouTube API Native Event] onReady - player.getDuration():",
                  dur,
                );
                if (nativePlayer.getVideoData) {
                  logger.info(
                    "[YouTube API Native Event] onReady - player.getVideoData():",
                    nativePlayer.getVideoData(),
                  );
                }
              } catch (e) {
                logger.error(
                  "[YouTube API Native Event] error checking player state on ready:",
                  e,
                );
              }

              this.onReady();

              if (this.pendingPlay) {
                logger.info("[YoutubeManager] Executing pending play");
                player.playVideo();
              }
              if (this.pendingPause) {
                logger.info("[YoutubeManager] Executing pending pause");
                player.pauseVideo();
              }
              if (this.pendingSeek !== null) {
                logger.info(
                  "[YoutubeManager] Executing pending seek:",
                  this.pendingSeek,
                );
                player.seekTo(this.pendingSeek, true);
              }
              this.pendingPlay = false;
              this.pendingPause = false;
              this.pendingSeek = null;

              resolve(player);
            },
            onStateChange: (event: any) => {
              logger.info(
                "[YouTube API Native Event] onStateChange event payload:",
                event,
              );
              if (this.isDestroyed) return;
              this.onStateChange(event.data as YouTubePlayerState);

              if (event.data === 1) {
                this.startTimePolling();
              } else if (event.data === 2 || event.data === 0) {
                this.stopTimePolling();
              }
            },
            onError: (event: any) => {
              logger.error(
                "[YouTube API Native Event] onError event payload:",
                event,
              );
              if (this.isDestroyed) return;
              if (!resolved) {
                resolved = true;
                resolve(null);
              }
              this.onError(event.data);
            },
          },
        });
        logger.info("[YoutubeManager] YT.Player constructor returned");
      } catch (e) {
        logger.error("[YoutubeManager] YT.Player constructor threw:", e);
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
        this.onError(5);
      }
    });
  }

  /**
   * Start polling for current time updates.
   */
  private startTimePolling() {
    this.stopTimePolling();
    this.timePollingTimer = setInterval(() => {
      if (this.isDestroyed || !this.player) {
        this.stopTimePolling();
        return;
      }
      try {
        this.onCurrentTimeUpdate(this.player.getCurrentTime());
      } catch {
        this.stopTimePolling();
      }
    }, 250);
  }

  private stopTimePolling() {
    if (this.timePollingTimer !== null) {
      clearInterval(this.timePollingTimer);
      this.timePollingTimer = null;
    }
  }

  queuePlay() {
    if (this.player) {
      this.player.playVideo();
    } else {
      this.pendingPlay = true;
    }
  }

  queuePause() {
    if (this.player) {
      this.player.pauseVideo();
    } else {
      this.pendingPause = true;
    }
  }

  queueSeek(seconds: number) {
    if (this.player) {
      this.player.seekTo(seconds, true);
    } else {
      this.pendingSeek = seconds;
    }
  }

  getPlayer(): YouTubeIFramePlayer | null {
    return this.player;
  }

  destroy() {
    logger.info("[YoutubeManager] destroy() called");
    this.isDestroyed = true;
    this.stopTimePolling();
    try {
      this.player?.destroy();
    } catch {}
    this.player = null;
    const wrapper = this.iframeContainer.querySelector("[data-yt-wrapper]");
    if (wrapper) wrapper.remove();
    const legacy = document.getElementById(this.playerId);
    if (legacy) legacy.remove();
  }
}
