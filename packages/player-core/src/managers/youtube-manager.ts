import type { YouTubeIFramePlayer } from "../types/youtube.types";
import { YouTubePlayerState } from "../types/youtube.types";

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
    console.log("[YoutubeManager] API already ready");
    return Promise.resolve();
  }
  if (apiLoading) {
    console.log("[YoutubeManager] API loading, queuing");
    return new Promise((resolve) => readyCallbacks.push(resolve));
  }

  apiLoading = true;
  return new Promise((resolve) => {
    // Define the global callback that YouTube calls when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("[YoutubeManager] onYouTubeIframeAPIReady fired");
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
    console.log("[YoutubeManager] Script tag injected");
  });
}

/**
 * YouTubeManager — handles the YouTube IFrame Player API lifecycle:
 * loading the API script, creating/destroying the player, and bridging
 * YouTube events to our player event callbacks.
 */
export class YoutubeManager {
  private iframeContainer: HTMLElement;
  private player: YouTubeIFramePlayer | null = null;
  private playerId: string;
  private pendingPlay = false;
  private pendingPause = false;
  private pendingSeek: number | null = null;
  private isDestroyed = false;

  /** Callbacks registered by YoutubePlayer */
  private onReady: () => void;
  private onStateChange: (state: YouTubePlayerState) => void;
  private onError: (errorCode: number) => void;
  private onCurrentTimeUpdate: (currentTime: number) => void;

  // Polling for time updates
  private timePollingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    container: HTMLElement,
    callbacks: {
      onReady: () => void;
      onStateChange: (state: YouTubePlayerState) => void;
      onError: (errorCode: number) => void;
      onCurrentTimeUpdate: (currentTime: number) => void;
    },
  ) {
    this.iframeContainer = container;
    this.playerId = `youtube-player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.onReady = callbacks.onReady;
    this.onStateChange = callbacks.onStateChange;
    this.onError = callbacks.onError;
    this.onCurrentTimeUpdate = callbacks.onCurrentTimeUpdate;
    console.log("[YoutubeManager] constructed, playerId:", this.playerId);
  }

  /**
   * Load a YouTube video by ID.
   * Returns the IFrame Player once ready, or null if destroyed.
   *
   * DOM architecture
   * ─────────────────
   * iframeContainer  (clipRef div, position:absolute inset:0)
   *   └─ wrapperDiv  (persistent, overflow:hidden, opacity:0 until ready)
   *        └─ targetDiv[id]  ← YouTube API replaces this with an <iframe>
   *
   * Why two divs?
   * The YouTube IFrame API REPLACES the element matching `id` with an <iframe>.
   * By having a separate wrapperDiv we keep a permanent reference that:
   *   • clips the oversized iframe (overflow:hidden)
   *   • stays invisible (opacity:0) until onReady fires so the native
   *     YouTube chrome (title bar, logo, controls) is never seen
   *   • lets us apply the 400%-height + translateY(-50%) trick to the
   *     actual <iframe> element after we locate it post-replacement
   */
  async load(
    videoId: string,
    autoPlay?: boolean,
    startTime?: number,
  ): Promise<YouTubeIFramePlayer | null> {
    console.log("[YoutubeManager] load() called for videoId:", videoId);

    await loadYouTubeApi();
    if (this.isDestroyed) {
      console.log("[YoutubeManager] destroyed during API load");
      return null;
    }

    const YT = (window as any).YT;
    if (!YT || !YT.Player) {
      console.error(
        "[YoutubeManager] YT.Player not available even after API load!",
      );
      this.onError(5);
      return null;
    }

    // ── Persistent wrapper (stays in DOM even after YT replaces the inner div) ──
    // Starts invisible — revealed only after onReady so the user never sees
    // the YouTube native UI during the initialization window.
    const wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("data-yt-wrapper", "");
    Object.assign(wrapperDiv.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      overflow: "hidden",       // clips the 400%-tall iframe
      pointerEvents: "none",    // let our custom controls handle all input
      opacity: "0",             // hidden until player is fully initialized
      background: "transparent",
    });
    this.iframeContainer.appendChild(wrapperDiv);

    // ── Inner target (YouTube will replace this <div> with an <iframe>) ──
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

    console.log(
      "[YoutubeManager] wrapper+target appended to DOM, id:",
      this.playerId,
    );

    const playerVars: Record<string, any> = {
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      playsinline: 1,
      cc_load_policy: 0,
      enablejsapi: 1,
      showinfo: 0,
      origin: window.location.origin,
    };

    if (autoPlay) playerVars.autoplay = 1;
    if (startTime) playerVars.start = Math.floor(startTime);

    console.log("[YoutubeManager] Creating YT.Player with id:", this.playerId);

    return new Promise<YouTubeIFramePlayer | null>((resolve) => {
      let resolved = false;

      try {
        const player = new YT.Player(this.playerId, {
          videoId,
          playerVars,
          width: "100%",
          height: "100%",
          events: {
            onReady: () => {
              console.log("[YoutubeManager] onReady fired");
              if (resolved) return;
              if (this.isDestroyed) {
                console.log("[YoutubeManager] destroyed before onReady");
                player.destroy();
                resolve(null);
                return;
              }
              this.player = player;
              resolved = true;

              // ── Apply chrome-hiding to the actual <iframe> ──────────────
              // The YouTube API has replaced targetDiv with an <iframe> that
              // has the same id. We find it inside wrapperDiv and scale it to
              // 400% height, centred vertically, so the YouTube UI overlays
              // (title bar, bottom controls, logo) bleed outside the wrapper's
              // overflow:hidden boundary and are clipped away.
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

              // ── Reveal with a smooth fade-in ─────────────────────────────
              // At this point controls:0 / modestbranding / etc. are in effect,
              // so the native YouTube UI is already hidden inside the iframe.
              wrapperDiv.style.transition = "opacity 250ms ease";
              wrapperDiv.style.opacity = "1";

              // Verify the player is actually ready
              try {
                const state = player.getPlayerState();
                console.log("[YoutubeManager] Player state on ready:", state);
                const dur = player.getDuration();
                console.log("[YoutubeManager] Player duration on ready:", dur);
              } catch (e) {
                console.error(
                  "[YoutubeManager] Error checking player state:",
                  e,
                );
              }

              this.onReady();

              // Execute any pending commands
              if (this.pendingPlay) {
                console.log("[YoutubeManager] Executing pending play");
                player.playVideo();
              }
              if (this.pendingPause) {
                console.log("[YoutubeManager] Executing pending pause");
                player.pauseVideo();
              }
              if (this.pendingSeek !== null) {
                console.log(
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
            onStateChange: (event: { data: number }) => {
              console.log("[YoutubeManager] onStateChange:", event.data);
              if (this.isDestroyed) return;
              this.onStateChange(event.data as YouTubePlayerState);

              if (event.data === 1) {
                this.startTimePolling();
              } else if (event.data === 2 || event.data === 0) {
                this.stopTimePolling();
              }
            },
            onError: (event: { data: number }) => {
              console.error("[YoutubeManager] onError:", event.data);
              if (this.isDestroyed) return;
              if (!resolved) {
                resolved = true;
                resolve(null);
              }
              this.onError(event.data);
            },
          },
        });
        console.log("[YoutubeManager] YT.Player constructor returned");
      } catch (e) {
        console.error("[YoutubeManager] YT.Player constructor threw:", e);
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
    console.log("[YoutubeManager] destroy() called");
    this.isDestroyed = true;
    this.stopTimePolling();
    try {
      this.player?.destroy();
    } catch {
      // Ignore destroy errors
    }
    this.player = null;
    // Remove the wrapper div (covers both old containerDiv and new wrapperDiv)
    const wrapper = this.iframeContainer.querySelector("[data-yt-wrapper]");
    if (wrapper) wrapper.remove();
    // Fallback: also try by id in case an old-style container is still around
    const legacy = document.getElementById(this.playerId);
    if (legacy) legacy.remove();
  }
}
