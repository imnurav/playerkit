import {
  PlayerControls,
  formatPlayerTime,
  getThemeConfig,
} from "@nurav/player-ui";
import { useControlsVisibility } from "./hooks/useControlsVisibility";
import { BufferingSpinner } from "./components/BufferingSpinner";
import { usePlayerKeyboard } from "./hooks/usePlayerKeyboard";
import { usePlayerGestures } from "./hooks/usePlayerGestures";
import { usePlayerTimeline } from "./hooks/usePlayerTimeline";
import { CenterOverlay } from "./components/CenterOverlay";
import { ErrorOverlay } from "./components/ErrorOverlay";
import { LiveBadge } from "./components/LiveBadge";
import { VideoView } from "./components/VideoView";
import type { Player } from "@nurav/player-core";
import { useHlsPlayer } from "./useHlsPlayer";
import type { HlsPlayerProps } from "./types";
import {
  SeekFeedbackOverlay,
  type SeekFeedbackType,
} from "./components/SeekFeedbackOverlay";
import {
  CenterPlayFeedback,
  type CenterPlayFeedbackType,
} from "./components/CenterPlayFeedback";
import {
  defaultPlaybackRates,
  SEEK_FEEDBACK_DURATION,
  CENTER_PLAY_FEEDBACK_DURATION,
} from "./constants";
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useCallback,
  type CSSProperties,
  useImperativeHandle,
} from "react";

export const HlsPlayer = forwardRef<Player, HlsPlayerProps>(function HlsPlayer(
  {
    src,
    root,
    poster,
    autoPlay,
    className,
    startTime,
    live,
    lowLatency: _lowLatency,
    tokenFetcher,
    onPlayerReady,
    seekStep = 10,
    theme = "kgs",
    customization,
    videoClassName,
    renderControls,
    themeOverrides,
    style,
    controls = true,
    keyboard = true,
    liveSyncDuration: _liveSyncDuration,
    playbackRates = defaultPlaybackRates,
    centerZoneX,
    centerZoneY,
    disableDevOptions = false,
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
    tokenFetcher,
    live:
      live ??
      ({
        syncDuration: _liveSyncDuration,
        lowLatency: _lowLatency ?? undefined,
      } as import("@nurav/player-core").LiveConfig),
    security: {
      disableDevOptions,
    },
  });

  const seekAccumulatedRef = useRef<{
    direction: -1 | 1;
    count: number;
    timer: number | null;
  }>({
    direction: 1,
    count: 0,
    timer: null,
  });

  const [seekFeedback, setSeekFeedback] = useState<SeekFeedbackType | null>(
    null,
  );
  const [centerPlayFeedback, setCenterPlayFeedback] =
    useState<CenterPlayFeedbackType | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [objectFit, setObjectFit] = useState<"contain" | "cover" | "fill">(
    customization?.objectFit ?? "contain",
  );

  // ─── Responsive Viewport Detection ───
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 760;
      setIsMobile(isSmallScreen || (hasTouch && window.innerWidth <= 1024));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Clean up seek accumulation timer on unmount
  useEffect(() => {
    return () => {
      const acc = seekAccumulatedRef.current;
      if (acc.timer) clearTimeout(acc.timer);
    };
  }, []);

  useImperativeHandle(ref, () => player as Player, [player]);

  useEffect(() => {
    if (player) onPlayerReady?.(player);
  }, [onPlayerReady, player]);

  const activeTheme = theme || "kgs";
  const resolvedTheme = useMemo(
    () => getThemeConfig(activeTheme),
    [activeTheme],
  );

  // ─── Custom Decoupled Sub-Hooks ───
  const { progress, buffered } = usePlayerTimeline(state);

  const {
    areControlsVisible,
    isSettingsOpenRef,
    showControls,
    scheduleHideControls,
  } = useControlsVisibility({
    state,
    theme: activeTheme,
    autoHideDelay: resolvedTheme.controls.autoHideDelay,
  });

  // ─── Interaction Feedback Callbacks ───
  const showSeekFeedback = useCallback(
    (side: "left" | "right", seconds: number) => {
      const feedback: SeekFeedbackType = { side, id: Date.now(), seconds };
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
    const feedback: CenterPlayFeedbackType = { id: Date.now(), action };
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

  // ─── Accumulated Relative Seek ───
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

  const toggleStretch = useCallback(() => {
    setObjectFit((current) => (current === "fill" ? "contain" : "fill"));
    showControls();
  }, [showControls]);

  // ─── Keyboard Orchestrator Hook ───
  usePlayerKeyboard({
    player,
    state,
    seekRelative,
    showControls,
    toggleStretch,
    enabled: keyboard,
  });

  // ─── Touch Gesture & Mobile Tap Orchestrator Hook ───
  const { handleTouchStart, handleMouseClick } = usePlayerGestures({
    player,
    state,
    isMobile,
    seekStep,
    showSeekFeedback,
    showCenterPlayFeedback,
    triggerHaptic,
    showControls,
    centerZoneX,
    centerZoneY,
  });

  const controlsVisible = areControlsVisible || !state?.isPlaying;
  const hasFatalError = !!error?.fatal;

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
      onFocus={showControls}
      onMouseLeave={scheduleHideControls}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") showControls();
      }}
      style={
        { ...resolvedTheme.vars, ...themeOverrides, ...style } as CSSProperties
      }
    >
      <div className="vp-player__clip">
        {/* Decoupled optimized Video Element and touch layer */}
        <VideoView
          ref={videoRef}
          videoClassName={videoClassName}
          poster={poster}
          objectFit={objectFit}
          {...videoProps}
        />

        {/* Security Lock Overlay */}
        {state?.isDevtoolsDetected && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              color: "#fff",
              zIndex: 999,
              textAlign: "center",
              padding: "2em",
              fontFamily: "var(--vp-font-family, sans-serif)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "3.5em",
                height: "3.5em",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "2px solid #ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1em",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "1.25em",
                fontWeight: 700,
                margin: "0 0 0.5em 0",
                letterSpacing: "0.02em",
                color: "#ef4444",
              }}
            >
              SECURITY LOCK ACTIVE
            </h2>
            <p
              style={{
                fontSize: "0.95em",
                color: "rgba(255, 255, 255, 0.7)",
                margin: 0,
                lineHeight: 1.5,
                maxWidth: "24em",
              }}
            >
              Developer Tools are currently open. Playback has been suspended to
              secure stream contents. Please close DevTools to resume.
            </p>
          </div>
        )}

        {/* Modular Buffering Spinner */}
        <BufferingSpinner
          isBuffering={!!state?.isBuffering}
          hasError={hasFatalError}
        />

        {/* Modular Fatal Error Overlay */}
        <ErrorOverlay error={error} onRetry={() => player?.retry()} />

        {/* Modular Seek Feedback Overlay */}
        <SeekFeedbackOverlay feedback={seekFeedback} />

        {/* Modular Center play/pause Feedback (Mobile) */}
        <CenterPlayFeedback feedback={centerPlayFeedback} />

        <div className="vp-player__gradient" />
      </div>

      {/* Floating Seek-to-Live Badge Indicator */}
      <LiveBadge
        isLive={!!state?.isLive}
        hasError={hasFatalError}
        isAtLiveEdge={!!state?.isAtLiveEdge}
        controlsVisible={controlsVisible}
        onSeekToLive={() => {
          player?.seekToLive();
          showControls();
        }}
      />

      {renderControls ? renderControls(controlsProps) : null}

      {/* Desktop Center Overlay (Play/Pause & Seek Overlay) */}
      <CenterOverlay
        isMobile={isMobile}
        hasError={hasFatalError}
        isPlaying={!!state?.isPlaying}
        seekStep={seekStep}
        controlsVisible={controlsVisible}
        showCenterOverlay={
          controls &&
          (customization?.showCenterOverlay ?? activeLayout.centerPlay)
        }
        centerOverlayGap={customization?.centerOverlayGap}
        onPlayToggle={() => void player?.togglePlay()}
        onSeek={seekRelative}
      />

      {/* Main Control Bar */}
      {controls && !hasFatalError ? (
        <PlayerControls
          state={state}
          theme={activeTheme}
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
