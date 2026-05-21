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

import type { Player, PlayerSnapshot } from "@varun/player-core";
import {
  getPlayerTheme,
  type PlayerThemeName,
  type PlayerThemeVars,
} from "@varun/player-themes";
import {
  IconPlay,
  IconPause,
  IconRewind,
  IconForward,
  basePlayerStyles,
  getAllThemeStyles,
  PlayerControls,
  formatPlayerTime,
  usePlayerControlPreset,
} from "@varun/player-ui";

import { useHlsPlayer, type UseHlsPlayerOptions } from "./use-hls-player";

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
export type HlsPlayerThemeOverrides = PlayerThemeVars;

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
  };

const defaultPlaybackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const DOUBLE_TAP_WINDOW = 320;
const SEEK_ACCUMULATOR_TIMEOUT = 600; // Seek counter resets after 600ms of inactivity
const SEEK_FEEDBACK_DURATION = 700;
const CENTER_PLAY_FEEDBACK_DURATION = 400;

export const HlsPlayer = forwardRef<Player, HlsPlayerProps>(function HlsPlayer(
  {
    className,
    controls = true,
    videoClassName,
    onPlayerReady,
    poster,
    renderControls,
    seekStep = 10,
    theme = "default",
    themeOverrides,
    playbackRates = defaultPlaybackRates,
    src,
    autoPlay,
    keyboard = true,
    root,
    startTime,
    ...videoProps
  },
  ref,
) {
  const { rootRef, videoRef, player, state } = useHlsPlayer({
    src,
    autoPlay,
    keyboard,
    root,
    startTime,
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
  // Shared settings state accessible to both HlsPlayer and platform controls
  const isSettingsOpenRef = useRef(false);

  // Detect mobile — touch-capable devices always get mobile layout
  // even in landscape orientation (where width may exceed 760px).
  // Desktop (non-touch) always gets desktop layout regardless of width.
  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsMobile(hasTouch);
  }, []);

  const progress = useMemo(() => {
    if (!state?.duration) return 0;
    return Math.min((state.currentTime / state.duration) * 100, 100);
  }, [state?.currentTime, state?.duration]);

  const buffered = useMemo(() => {
    return state?.bufferedPercent || 0;
  }, [state?.bufferedPercent]);

  useImperativeHandle(ref, () => player as Player, [player]);

  useEffect(() => {
    if (player) onPlayerReady?.(player);
  }, [onPlayerReady, player]);

  useEffect(() => {
    showControls();
    return () => clearHideTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.isPlaying, theme]);

  const resolvedTheme = useMemo(() => getPlayerTheme(theme), [theme]);

  // ===== Auto-hide controls =====
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

  // Show seek feedback animation with accumulated seconds
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

  // Show center play/pause icon animation
  const showCenterPlayFeedback = useCallback((action: "play" | "pause") => {
    const feedback: CenterPlayFeedback = { id: Date.now(), action };
    setCenterPlayFeedback(feedback);
    window.setTimeout(() => {
      setCenterPlayFeedback((current) =>
        current?.id === feedback.id ? null : current,
      );
    }, CENTER_PLAY_FEEDBACK_DURATION);
  }, []);

  // Haptic feedback on mobile
  const triggerHaptic = useCallback(() => {
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [isMobile]);

  // Accumulated seek with feedback (used by controls, keyboard, etc.)
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
      // Reset count if direction changed or last click was too long ago
      if (acc.direction !== direction) {
        acc.count = 0;
      }
      acc.direction = direction;
      if (acc.timer) clearTimeout(acc.timer);
      acc.count += 1;
      const totalSeconds = seekStep * acc.count;
      player.seek(state.currentTime + direction * totalSeconds);
      showSeekFeedback(direction === -1 ? "left" : "right", totalSeconds);
      // Reset accumulator after inactivity
      acc.timer = window.setTimeout(() => {
        acc.count = 0;
        acc.timer = null;
      }, 800);
    },
    [player, state, seekStep, showSeekFeedback],
  );

  // ===== Touch handling =====
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      // Only handle if not interacting with controls or settings
      const target = event.target as HTMLElement;
      if (
        target.closest("[data-vhp-controls]") ||
        target.closest(".vhp-settings-anchor") ||
        target.closest(".vhp-top-controls-right") ||
        target.closest(".vhp-settings-backdrop") ||
        target.closest(".vhp-settings-sheet") ||
        target.closest(".vhp-settings-panel") ||
        target.closest(".vhp-settings-dropdown")
      )
        return;

      showControls();

      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const now = Date.now();
      const lastTap = lastTapRef.current;

      if (lastTap && now - lastTap.at < DOUBLE_TAP_WINDOW) {
        // Double-tap detected — seek
        event.preventDefault();

        // Cancel any pending play/pause from the first tap
        if (pendingPlayTimerRef.current) {
          clearTimeout(pendingPlayTimerRef.current);
          pendingPlayTimerRef.current = null;
        }

        const side: -1 | 1 = lastTap.x < rect.width / 2 ? -1 : 1;

        // Reset counter if side changed
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

      // Mark that touch was handled so click handler doesn't double-fire
      isTouchHandledRef.current = true;

      // First tap in a potential double-tap sequence — don't do anything yet
      lastTapRef.current = { at: now, x };

      // Taps too far apart — reset seek counter
      if (lastTap && now - lastTap.at >= DOUBLE_TAP_WINDOW) {
        seekCountRef.current = 0;
        lastSeekSideRef.current = null;
      }

      // Clear/reset the seek accumulator timeout
      if (seekCountTimerRef.current) {
        clearTimeout(seekCountTimerRef.current);
      }
      seekCountTimerRef.current = window.setTimeout(() => {
        seekCountRef.current = 0;
        lastSeekSideRef.current = null;
        seekCountTimerRef.current = null;
      }, SEEK_ACCUMULATOR_TIMEOUT);

      // Single tap in center area — schedule play/pause with a delay
      // to allow detection of double-tap
      const isCenter = x > rect.width * 0.3 && x < rect.width * 0.7;
      if (isCenter) {
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

  // ===== Mouse click handling (mobile only for center tap) =====
  const handleMouseClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      showControls();

      // On mobile, touch events fire first and handle play/pause / seek.
      // The synthetic click event that follows must be ignored to avoid double-toggle.
      if (isTouchHandledRef.current) {
        isTouchHandledRef.current = false;
        return;
      }

      // Center tap to play/pause is mobile-only. On desktop the center play button handles it.
      if (!isMobile) return;

      const target = event.target as HTMLElement;
      if (
        target.closest("[data-vhp-controls]") ||
        target.closest(".vhp-settings-anchor")
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

  // ===== Keyboard handling (global shortcuts) =====
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

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

  const activeControlPreset = usePlayerControlPreset(resolvedTheme.controls);
  const controlsVisible = areControlsVisible || !state?.isPlaying;

  const controlsProps = {
    player,
    state,
    progress,
    buffered,
    seekRelative,
    formatTime: formatPlayerTime,
  };

  return (
    <div
      ref={rootRef}
      className={["vhp-player", resolvedTheme.className, className]
        .filter(Boolean)
        .join(" ")}
      tabIndex={0}
      data-controls-visible={controlsVisible ? "true" : "false"}
      data-playing={state?.isPlaying ? "true" : "false"}
      onClick={handleMouseClick}
      onTouchStart={handleTouchStart}
      onFocus={handlePlayerFocus}
      onMouseLeave={scheduleHideControls}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") showControls();
      }}
      style={{ ...resolvedTheme.vars, ...themeOverrides } as CSSProperties}
    >
      <style>
        {basePlayerStyles}
        {getAllThemeStyles()}
      </style>

      <div className="vhp-clip">
        <video
          ref={videoRef}
          className={["vhp-video", videoClassName].filter(Boolean).join(" ")}
          controls={false}
          playsInline
          poster={poster}
          {...videoProps}
        />

        {/* Invisible tap layer — just for layout reference */}
        <div className="vhp-tap-layer" aria-hidden="true" />

        {state?.isBuffering ? (
          <div className="vhp-buffering" aria-label="Buffering">
            <span />
          </div>
        ) : null}

        {/* Seek feedback overlay */}
        {seekFeedback ? (
          <div
            className={`vhp-seek-feedback vhp-seek-feedback-${seekFeedback.side}`}
            key={seekFeedback.id}
          >
            {seekFeedback.side === "left" ? <IconRewind /> : <IconForward />}
            <span>
              {seekFeedback.side === "left" ? "-" : "+"}
              {seekFeedback.seconds}
            </span>
          </div>
        ) : null}

        {/* Center play/pause feedback overlay (mobile) */}
        {centerPlayFeedback ? (
          <div className="vhp-center-action" key={centerPlayFeedback.id}>
            {centerPlayFeedback.action === "play" ? <IconPlay /> : <IconPause />}
          </div>
        ) : null}

        <div className="vhp-gradient" />
      </div>

      {renderControls ? renderControls(controlsProps) : null}

      {controls && activeControlPreset.centerPlay && !isMobile ? (
        <button
          type="button"
          className="vhp-center-play"
          aria-label={state?.isPlaying ? "Pause" : "Play"}
          onClick={() => void player?.togglePlay()}
        >
          {state?.isPlaying ? <IconPause /> : <IconPlay />}
        </button>
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
          onControlsInteraction={showControls}
          onSettingsOpenChange={(open) => {
            isSettingsOpenRef.current = open;
          }}
          mobilePreset={resolvedTheme.controls.mobile}
          desktopPreset={resolvedTheme.controls.desktop}
        />
      ) : null}
    </div>
  );
});
