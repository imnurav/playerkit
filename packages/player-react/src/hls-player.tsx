import type { Player, PlayerSnapshot, TokenFetcher, PlayerErrorCategory } from "@varun/player-core";
import { useHlsPlayer, type UseHlsPlayerOptions } from "./use-hls-player";
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useCallback,
  type ReactNode,
  type FocusEvent,
  type CSSProperties,
  useImperativeHandle,
  type VideoHTMLAttributes,
} from "react";
import {
  IconPlay,
  IconPause,
  IconRewind,
  IconForward,
  PlayerControls,
  formatPlayerTime,
  getThemeConfig,
  type PlayerThemeName,
  type ThemeVars,
  type PlayerCustomization,
} from "@varun/player-ui";

// ─── Error Helpers ───────────────────────────────────────────────────────────

function getErrorTitle(category?: PlayerErrorCategory): string {
  switch (category) {
    case "network":
      return "Connection Lost";
    case "source":
      return "Stream Unavailable";
    case "auth":
      return "Access Denied";
    case "media":
      return "Playback Error";
    case "server":
      return "Server Error";
    default:
      return "Unable to Play";
  }
}

function ErrorCategoryIcon({ category }: { category?: PlayerErrorCategory }) {
  const props = { width: 48, height: 48, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (category) {
    case "network":
      // Wi-Fi off icon
      return (
        <svg {...props}>
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      );
    case "source":
      // Film / video not found icon
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
      );
    case "auth":
      // Lock icon
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "media":
      // Alert triangle icon
      return (
        <svg {...props}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "server":
      // Server / cloud off icon
      return (
        <svg {...props}>
          <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    default:
      // Generic alert circle
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

// Retry arrow icon
function IconRetry() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}


// ─── Types ───────────────────────────────────────────────────────────────────

type SeekFeedback = {
  side: "left" | "right";
  id: number;
  seconds: number;
};

type CenterPlayFeedback = {
  id: number;
  action: "play" | "pause";
};

export type HlsPlayerTheme = PlayerThemeName;
export type HlsPlayerThemeOverrides = ThemeVars;

export type HlsPlayerRenderControlsProps = {
  player: Player | null;
  state: PlayerSnapshot | null;
  progress: number;
  buffered: number;
  seekRelative: (direction: -1 | 1) => void;
  formatTime: (seconds: number) => string;
};

export type HlsPlayerProps = UseHlsPlayerOptions &
  Omit<
    VideoHTMLAttributes<HTMLVideoElement>,
    "autoPlay" | "className" | "controls" | "src"
  > & {
    className?: string;
    videoClassName?: string;
    controls?: boolean;
    onPlayerReady?: (player: Player) => void;
    poster?: string;
    renderControls?: (props: HlsPlayerRenderControlsProps) => ReactNode;
    seekStep?: number;
    theme?: HlsPlayerTheme;
    themeOverrides?: HlsPlayerThemeOverrides;
    playbackRates?: number[];
    /** Token fetcher for authenticated streams */
    tokenFetcher?: TokenFetcher;
    /** Seconds threshold to consider "at live edge" */
    liveSyncDuration?: number;
    /** Enable low-latency HLS mode */
    lowLatency?: boolean;
    /**
     * Fine-grained control over which UI elements are visible.
     * Overrides theme defaults.
     *
     * @example
     * ```tsx
     * <HlsPlayer
     *   src="..."
     *   customization={{
     *     showPlayButton: true,
     *     showCenterOverlay: true,
     *     volumeControl: "vertical",
     *     centerOverlayGap: 40,
     *   }}
     * />
     * ```
     */
    customization?: PlayerCustomization;
  };

// ─── Constants ───────────────────────────────────────────────────────────────

const defaultPlaybackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const DOUBLE_TAP_WINDOW = 320;
const SEEK_ACCUMULATOR_TIMEOUT = 600;
const SEEK_FEEDBACK_DURATION = 700;
const CENTER_PLAY_FEEDBACK_DURATION = 400;

// ─── Component ───────────────────────────────────────────────────────────────

export const HlsPlayer = forwardRef<Player, HlsPlayerProps>(function HlsPlayer(
  {
    src,
    root,
    poster,
    autoPlay,
    className,
    startTime,
    lowLatency,
    tokenFetcher,
    onPlayerReady,
    seekStep = 10,
    theme = "kgs",
    customization,
    videoClassName,
    renderControls,
    themeOverrides,
    controls = true,
    keyboard = true,
    liveSyncDuration,
    playbackRates = defaultPlaybackRates,
    ...videoProps
  },
  ref,
) {
  const { rootRef, videoRef, player, state, error } = useHlsPlayer({
    src,
    root,
    autoPlay,
    keyboard,
    startTime,
    lowLatency,
    tokenFetcher,
    liveSyncDuration,
  });
  const lastTapRef = useRef<{ at: number; x: number } | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const seekCountRef = useRef<number>(0);
  const lastSeekSideRef = useRef<-1 | 1 | null>(null);
  const seekCountTimerRef = useRef<number | null>(null);
  const isTouchHandledRef = useRef(false);
  const pendingPlayTimerRef = useRef<number | null>(null);
  const [seekFeedback, setSeekFeedback] = useState<SeekFeedback | null>(null);
  const [centerPlayFeedback, setCenterPlayFeedback] =
    useState<CenterPlayFeedback | null>(null);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const isSettingsOpenRef = useRef(false);
  const [objectFit, setObjectFit] = useState<"contain" | "cover" | "fill">(
    customization?.objectFit ?? "contain",
  );

  // ─── Detect mobile ──────────────────────────────────────────────────────
  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsMobile(hasTouch);
  }, []);

  // ─── Computed values ────────────────────────────────────────────────────
  const progress = useMemo(() => {
    if (!state) return 0;

    // For live streams, compute progress within the DVR/seekable window
    if (state.isLive && state.seekableEnd > state.seekableStart) {
      const range = state.seekableEnd - state.seekableStart;
      if (range <= 0) return 100; // at live edge, full bar
      return Math.min(
        ((state.currentTime - state.seekableStart) / range) * 100,
        100,
      );
    }

    // VOD: standard progress
    if (!state.duration) return 0;
    return Math.min((state.currentTime / state.duration) * 100, 100);
  }, [
    state?.currentTime,
    state?.duration,
    state?.isLive,
    state?.seekableStart,
    state?.seekableEnd,
  ]);

  const buffered = useMemo(() => {
    if (!state) return 0;

    // For live streams, compute buffered within the seekable window
    if (state.isLive && state.seekableEnd > state.seekableStart) {
      const range = state.seekableEnd - state.seekableStart;
      if (range <= 0) return 0;
      return Math.min(
        ((state.bufferedEnd - state.seekableStart) / range) * 100,
        100,
      );
    }

    return state.bufferedPercent || 0;
  }, [
    state?.bufferedPercent,
    state?.bufferedEnd,
    state?.isLive,
    state?.seekableStart,
    state?.seekableEnd,
  ]);

  useImperativeHandle(ref, () => player as Player, [player]);

  useEffect(() => {
    if (player) onPlayerReady?.(player);
  }, [onPlayerReady, player]);

  const resolvedTheme = useMemo(() => getThemeConfig(theme), [theme]);

  // ─── Auto-hide controls ─────────────────────────────────────────────────
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimer();
    if (!state?.isPlaying || isSettingsOpenRef.current) return;

    hideTimerRef.current = window.setTimeout(() => {
      isSettingsOpenRef.current = false;
      setAreControlsVisible(false);
    }, resolvedTheme.controls.autoHideDelay);
  }, [clearHideTimer, state?.isPlaying, resolvedTheme.controls.autoHideDelay]);

  const showControls = useCallback(() => {
    setAreControlsVisible(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    showControls();
    return () => clearHideTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.isPlaying, theme]);

  // ─── Seek feedback ──────────────────────────────────────────────────────
  const showSeekFeedback = useCallback(
    (side: "left" | "right", seconds: number) => {
      const feedback: SeekFeedback = { side, id: Date.now(), seconds };
      setSeekFeedback(feedback);
      window.setTimeout(() => {
        setSeekFeedback((current) =>
          current?.id === feedback.id ? null : current,
        );
      }, SEEK_FEEDBACK_DURATION);
    },
    [],
  );

  const showCenterPlayFeedback = useCallback((action: "play" | "pause") => {
    const feedback: CenterPlayFeedback = { id: Date.now(), action };
    setCenterPlayFeedback(feedback);
    window.setTimeout(() => {
      setCenterPlayFeedback((current) =>
        current?.id === feedback.id ? null : current,
      );
    }, CENTER_PLAY_FEEDBACK_DURATION);
  }, []);

  const triggerHaptic = useCallback(() => {
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [isMobile]);

  // ─── Accumulated seek ───────────────────────────────────────────────────
  const seekAccumulatedRef = useRef<{
    direction: -1 | 1;
    count: number;
    timer: number | null;
  }>({
    direction: 1,
    count: 0,
    timer: null,
  });

  const seekRelative = useCallback(
    (direction: -1 | 1) => {
      if (!player || !state) return;
      const acc = seekAccumulatedRef.current;
      if (acc.direction !== direction) {
        acc.count = 0;
      }
      acc.direction = direction;
      if (acc.timer) clearTimeout(acc.timer);
      acc.count += 1;
      const totalSeconds = seekStep * acc.count;
      player.seek(state.currentTime + direction * totalSeconds);
      showSeekFeedback(direction === -1 ? "left" : "right", totalSeconds);
      acc.timer = window.setTimeout(() => {
        acc.count = 0;
        acc.timer = null;
      }, 800);
    },
    [player, state, seekStep, showSeekFeedback],
  );

  // ─── Touch handling ─────────────────────────────────────────────────────
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (
        target.closest("[data-vp-controls]") ||
        target.closest(".vp-settings-anchor") ||
        target.closest(".vp-top-controls__right") ||
        target.closest(".vp-settings-backdrop") ||
        target.closest(".vp-settings-sheet") ||
        target.closest(".vp-settings-panel") ||
        target.closest(".vp-settings-dropdown")
      )
        return;

      showControls();

      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (lastTap && now - lastTap.at < DOUBLE_TAP_WINDOW) {
        event.preventDefault();
        if (pendingPlayTimerRef.current) {
          clearTimeout(pendingPlayTimerRef.current);
          pendingPlayTimerRef.current = null;
        }

        const side: -1 | 1 = lastTap.x < rect.width / 2 ? -1 : 1;
        if (lastSeekSideRef.current !== side) {
          seekCountRef.current = 0;
        }
        lastSeekSideRef.current = side;
        seekCountRef.current += 1;
        const totalSeconds = seekStep * seekCountRef.current;
        if (!player || !state) return;
        player.seek(state.currentTime + side * totalSeconds);
        showSeekFeedback(side === -1 ? "left" : "right", totalSeconds);
        triggerHaptic();
        lastTapRef.current = null;
        return;
      }

      isTouchHandledRef.current = true;
      lastTapRef.current = { at: now, x };

      if (lastTap && now - lastTap.at >= DOUBLE_TAP_WINDOW) {
        seekCountRef.current = 0;
        lastSeekSideRef.current = null;
      }

      if (seekCountTimerRef.current) {
        clearTimeout(seekCountTimerRef.current);
      }
      seekCountTimerRef.current = window.setTimeout(() => {
        seekCountRef.current = 0;
        lastSeekSideRef.current = null;
        seekCountTimerRef.current = null;
      }, SEEK_ACCUMULATOR_TIMEOUT);

      // Only trigger play/pause in a tight center zone: 35%-65% width,
      // and vertically in the middle 35%-65%. This avoids accidental
      // triggers when tapping near top controls, settings, or bottom bar.
      const y = touch.clientY - rect.top;
      const isCenterX = x > rect.width * 0.3 && x < rect.width * 0.7;
      const isCenterY = y > rect.height * 0.3 && y < rect.height * 0.7;
      if (isCenterX && isCenterY) {
        if (pendingPlayTimerRef.current) {
          clearTimeout(pendingPlayTimerRef.current);
          pendingPlayTimerRef.current = null;
        }
        pendingPlayTimerRef.current = window.setTimeout(() => {
          pendingPlayTimerRef.current = null;
          if (!player || !state) return;
          const wasPlaying = state.isPlaying;
          void player.togglePlay();
          if (isMobile) {
            showCenterPlayFeedback(wasPlaying ? "pause" : "play");
          }
        }, DOUBLE_TAP_WINDOW + 10);
      }
    },
    [
      showControls,
      seekRelative,
      player,
      isMobile,
      showCenterPlayFeedback,
      triggerHaptic,
    ],
  );

  const handleMouseClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      showControls();
      if (isTouchHandledRef.current) {
        isTouchHandledRef.current = false;
        return;
      }
      if (!isMobile) return;
      const target = event.target as HTMLElement;
      if (
        target.closest("[data-vp-controls]") ||
        target.closest(".vp-settings-anchor")
      )
        return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const isCenter = x > rect.width * 0.3 && x < rect.width * 0.7;
      if (isCenter) {
        if (!player || !state) return;
        const wasPlaying = state.isPlaying;
        void player.togglePlay();
        showCenterPlayFeedback(wasPlaying ? "pause" : "play");
      }
    },
    [showControls, player, state, isMobile, showCenterPlayFeedback],
  );

  // ─── Keyboard handling ──────────────────────────────────────────────────
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tag = target?.tagName;
      // Block keyboard shortcuts only for text inputs, not range sliders
      if (tag === "TEXTAREA" || tag === "SELECT") return;
      if (tag === "INPUT" && (target as HTMLInputElement).type !== "range")
        return;
      if (!player || !state) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          void player.togglePlay();
          showControls();
          break;
        case "ArrowLeft":
          event.preventDefault();
          seekRelative(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          seekRelative(1);
          break;
        case "KeyF":
          event.preventDefault();
          void player.toggleFullscreen();
          break;
        case "KeyM":
          event.preventDefault();
          state.isMuted ? player.unmute() : player.mute();
          break;
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [player, state, showControls, seekRelative]);

  const handlePlayerFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.target)) showControls();
    },
    [showControls],
  );

  const controlsVisible = areControlsVisible || !state?.isPlaying;

  const controlsProps = {
    player,
    state,
    progress,
    buffered,
    seekRelative,
    formatTime: formatPlayerTime,
  };

  const activeLayout = isMobile
    ? resolvedTheme.controls.mobile
    : resolvedTheme.controls.desktop;

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      ref={rootRef}
      className={["vp-player", resolvedTheme.className, className]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      data-controls-visible={controlsVisible ? "true" : "false"}
      data-playing={state?.isPlaying ? "true" : "false"}
      data-live={state?.isLive ? "true" : "false"}
      onClick={handleMouseClick}
      onTouchStart={handleTouchStart}
      onFocus={handlePlayerFocus}
      onMouseLeave={scheduleHideControls}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") showControls();
      }}
      style={{ ...resolvedTheme.vars, ...themeOverrides } as CSSProperties}
    >
      <div className="vp-player__clip">
        <video
          ref={videoRef}
          className={["vp-player__video", videoClassName]
            .filter(Boolean)
            .join(" ")}
          controls={false}
          playsInline
          poster={poster}
          style={{ objectFit }}
          {...videoProps}
        />

        {/* Invisible tap layer */}
        <div className="vp-tap-layer" aria-hidden="true" />

        {state?.isBuffering && !error ? (
          <div className="vp-buffering" aria-label="Buffering">
            <span className="vp-buffering__spinner" />
          </div>
        ) : null}

        {/* Fatal error overlay — full professional design */}
        {error?.fatal && (
          <div className="vp-error-overlay" role="alert">
            <div className="vp-error-overlay__icon">
              <ErrorCategoryIcon category={error.category} />
            </div>
            <div className="vp-error-overlay__title">
              {getErrorTitle(error.category)}
            </div>
            <div className="vp-error-overlay__message">
              {error.message}
            </div>
            {error.category !== "media" && (
              <button
                type="button"
                className="vp-error-overlay__retry"
                onClick={(e) => {
                  e.stopPropagation();
                  player?.retry();
                }}
              >
                <IconRetry />
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Seek feedback */}
        {seekFeedback ? (
          <div
            className={`vp-seek-feedback vp-seek-feedback--${seekFeedback.side}`}
            key={seekFeedback.id}
          >
            {seekFeedback.side === "left" ? <IconRewind /> : <IconForward />}
            <span>
              {seekFeedback.side === "left" ? "-" : "+"}
              {seekFeedback.seconds}
            </span>
          </div>
        ) : null}

        {/* Center play/pause feedback (mobile) */}
        {centerPlayFeedback ? (
          <div className="vp-center-action" key={centerPlayFeedback.id}>
            {centerPlayFeedback.action === "play" ? (
              <IconPlay />
            ) : (
              <IconPause />
            )}
          </div>
        ) : null}

        <div className="vp-player__gradient" />
      </div>

      {/* Floating indicator — hides/reveals with controls */}
      {state?.isLive && !error?.fatal && (
        <button
          type="button"
          className={`vp-seek-to-live${state.isAtLiveEdge ? " vp-seek-to-live--live" : ""}${!controlsVisible ? " vp-seek-to-live--hidden" : ""}`}
          onClick={() => {
            if (!state.isAtLiveEdge) {
              player?.seekToLive();
              showControls();
            }
          }}
          aria-label={state.isAtLiveEdge ? "Live" : "Go to live"}
        >
          <span className="vp-live-dot" />
          {state.isAtLiveEdge ? "LIVE" : "Go Live"}
        </button>
      )}

      {renderControls ? renderControls(controlsProps) : null}

      {controls &&
        !isMobile &&
        !error?.fatal &&
        (customization?.showCenterOverlay ?? activeLayout.centerPlay) ? (
        <div
          className="vp-center-overlay"
          style={
            customization?.centerOverlayGap
              ? ({
                gap: `${customization.centerOverlayGap}px`,
              } as CSSProperties)
              : undefined
          }
        >
          <button
            type="button"
            className="vp-center-btn vp-center-btn--seek"
            aria-label={`Seek backward ${seekStep} seconds`}
            onClick={(e) => {
              e.stopPropagation();
              seekRelative(-1);
            }}
          >
            <IconRewind />
            {/* <span className="vp-center-btn__label">{seekStep}</span> */}
          </button>

          <button
            type="button"
            className="vp-center-btn vp-center-btn--play"
            aria-label={state?.isPlaying ? "Pause" : "Play"}
            onClick={(e) => {
              e.stopPropagation();
              void player?.togglePlay();
            }}
          >
            {state?.isPlaying ? <IconPause /> : <IconPlay />}
          </button>

          <button
            type="button"
            className="vp-center-btn vp-center-btn--seek"
            aria-label={`Seek forward ${seekStep} seconds`}
            onClick={(e) => {
              e.stopPropagation();
              seekRelative(1);
            }}
          >
            <IconForward />
            {/* <span className="vp-center-btn__label">{seekStep}</span> */}
          </button>
        </div>
      ) : null}

      {controls && !error?.fatal ? (
        <PlayerControls
          state={state}
          theme={theme}
          player={player}
          buffered={buffered}
          progress={progress}
          isMobile={isMobile}
          seekRelative={seekRelative}
          playbackRates={playbackRates}
          controlsVisible={controlsVisible}
          customization={customization}
          objectFit={objectFit}
          onObjectFitChange={setObjectFit}
          onControlsInteraction={showControls}
          onSettingsOpenChange={(open) => {
            isSettingsOpenRef.current = open;
          }}
        />
      ) : null}
    </div>
  );
});
