import type { Player, PlayerSnapshot, TokenFetcher } from "@varun/player-core";
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
  const { rootRef, videoRef, player, state } = useHlsPlayer({
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

        {state?.isBuffering ? (
          <div className="vp-buffering" aria-label="Buffering">
            <span className="vp-buffering__spinner" />
          </div>
        ) : null}

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
      {state?.isLive && (
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

      {controls ? (
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
