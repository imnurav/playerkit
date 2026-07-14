import { YoutubeConfigBuilder } from "./youtube/youtube-config-builder";
import { YoutubeEventRouter } from "./youtube/youtube-event-router";
import type { YouTubeIFramePlayer } from "../types/youtube.types";
import { YouTubePlayerState } from "../types/youtube.types";
import { loadYouTubeApi } from "./youtube/youtube-loader";
import { logger } from "../utils/logger";

/**
 * YouTubeEngine — handles the YouTube IFrame Player API lifecycle:
 * loading the API script, creating/destroying the player, and bridging
 * YouTube events to our player event callbacks.
 */
export class YoutubeEngine {
  private playerId: string;
  private pendingPlay = false;
  private isDestroyed = false;
  private pendingPause = false;
  private iframeContainer: HTMLElement;
  private pendingSeek: number | null = null;
  private player: YouTubeIFramePlayer | null = null;
  private eventRouter: YoutubeEventRouter;

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
    this.eventRouter = new YoutubeEventRouter({
      onReady: () => this.onReady(),
      onStateChange: (state) => this.onPlayerStateChange(state),
      onError: (code) => this.onPlayerError(code),
    });
    logger.info("[YoutubeEngine] constructed, playerId:", this.playerId);
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
    logger.info("[YoutubeEngine] load() called for videoId:", videoId);

    await loadYouTubeApi();
    if (this.isDestroyed) {
      logger.info("[YoutubeEngine] destroyed during API load");
      return null;
    }

    const YT = (window as any).YT;
    if (!YT || !YT.Player) {
      logger.error(
        "[YoutubeEngine] YT.Player not available even after API load!",
      );
      this.onError(5);
      return null;
    }

    this.cleanupOldElements();

    const wrapperDiv = this.createWrapperElement();
    const targetDiv = this.createTargetElement();
    wrapperDiv.appendChild(targetDiv);
    this.iframeContainer.appendChild(wrapperDiv);

    logger.info(
      "[YoutubeEngine] wrapper+target appended to DOM, id:",
      this.playerId,
    );

    const playerVars = YoutubeConfigBuilder.build(autoPlay, startTime);
    logger.info("[YoutubeEngine] Creating YT.Player with id:", this.playerId);

    return new Promise<YouTubeIFramePlayer | null>((resolve) => {
      let resolved = false;

      try {
        const events = this.eventRouter.routeEvents(
          (p) => {
            if (resolved) return;
            resolved = true;
            resolve(p);
          },
          (targetPlayer) => {
            this.onPlayerReady(targetPlayer, wrapperDiv);
          },
        );

        new YT.Player(this.playerId, {
          videoId,
          playerVars,
          width: "100%",
          height: "100%",
          events,
        });
      } catch (e) {
        logger.error("[YoutubeEngine] YT.Player constructor threw:", e);
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
        this.onError(5);
      }
    });
  }

  private cleanupOldElements() {
    this.stopTimePolling();
    if (this.player) {
      try {
        this.player.destroy();
      } catch {}
      this.player = null;
    }
    const oldWrappers =
      this.iframeContainer.querySelectorAll("[data-yt-wrapper]");
    oldWrappers.forEach((w) => w.remove());
    const legacy = document.getElementById(this.playerId);
    if (legacy) legacy.remove();
  }

  private createWrapperElement(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-yt-wrapper", "");
    Object.assign(wrapper.style, {
      top: "0",
      left: "0",
      width: "100%",
      opacity: "0",
      height: "100%",
      position: "absolute",
      background: "transparent",
      overflow: "hidden",
      pointerEvents: "none",
    });
    return wrapper;
  }

  private createTargetElement(): HTMLElement {
    const target = document.createElement("div");
    target.id = this.playerId;
    Object.assign(target.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
    });
    return target;
  }

  private onPlayerReady(player: YouTubeIFramePlayer, wrapperDiv: HTMLElement) {
    logger.info("[YouTube API Native Event] onPlayerReady internal handler");
    if (this.isDestroyed) {
      logger.info("[YoutubeEngine] destroyed before onPlayerReady");
      try {
        player.destroy();
      } catch {}
      return;
    }

    this.player = player;

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

    wrapperDiv.style.transition = "opacity 100ms ease";
    wrapperDiv.style.opacity = "1";

    try {
      const state = player.getPlayerState();
      logger.info("[YouTube API Native Event] onReady - state:", state);
    } catch (e) {
      logger.error(
        "[YouTube API Native Event] error checking state on ready:",
        e,
      );
    }

    if (this.pendingPlay) {
      logger.info("[YoutubeEngine] Executing pending play");
      player.playVideo();
    }
    if (this.pendingPause) {
      logger.info("[YoutubeEngine] Executing pending pause");
      player.pauseVideo();
    }
    if (this.pendingSeek !== null) {
      logger.info("[YoutubeEngine] Executing pending seek:", this.pendingSeek);
      player.seekTo(this.pendingSeek, true);
    }
    this.pendingPlay = false;
    this.pendingPause = false;
    this.pendingSeek = null;
  }

  private onPlayerStateChange(ytState: YouTubePlayerState) {
    logger.info("[YouTube API Native Event] onStateChange:", ytState);
    if (this.isDestroyed) return;
    this.onStateChange(ytState);

    if (ytState === YouTubePlayerState.PLAYING) {
      this.startTimePolling();
    } else if (
      ytState === YouTubePlayerState.PAUSED ||
      ytState === YouTubePlayerState.ENDED
    ) {
      this.stopTimePolling();
    }
  }

  private onPlayerError(errorCode: number) {
    logger.error("[YouTube API Native Event] onError:", errorCode);
    if (this.isDestroyed) return;
    this.onError(errorCode);
  }

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
    logger.info("[YoutubeEngine] destroy() called");
    this.isDestroyed = true;
    this.cleanupOldElements();
  }
}
