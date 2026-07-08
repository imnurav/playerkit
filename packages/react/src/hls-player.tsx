import { usePlayerMouseInteractions } from "./hooks/usePlayerMouseInteractions";
import { TouchDiagnosticOverlay } from "./components/TouchDiagnosticOverlay";
import { usePlayerTouchGestures } from "./hooks/usePlayerTouchGestures";
import { SecurityLockOverlay } from "./components/SecurityLockOverlay";
import { SeekFeedbackOverlay } from "./components/SeekFeedbackOverlay";
import { useControlsVisibility } from "./hooks/useControlsVisibility";
import { usePlayerRelativeSeek } from "./hooks/usePlayerRelativeSeek";
import { CenterPlayFeedback } from "./components/CenterPlayFeedback";
import { BufferingSpinner } from "./components/BufferingSpinner";
import { usePlayerObjectFit } from "./hooks/usePlayerObjectFit";
import { usePlayerKeyboard } from "./hooks/usePlayerKeyboard";
import { usePlayerTimeline } from "./hooks/usePlayerTimeline";
import { usePlayerFeedback } from "./hooks/usePlayerFeedback";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { CenterOverlay } from "./components/CenterOverlay";
import { ErrorOverlay } from "./components/ErrorOverlay";
import { useCheckMobile } from "./hooks/useCheckMobile";
import { useOrientation } from "./hooks/useOrientation";
import { HudFeedback } from "./components/HudFeedback";
import { determinePlayerType } from "./utils/helpers";
import { LiveBadge } from "./components/LiveBadge";
import { VideoView } from "./components/VideoView";
import { defaultPlaybackRates } from "./constants";
import { useHlsPlayer } from "./useHlsPlayer";
import type { HlsPlayerProps } from "./types";
import "@playerkit/ui/styles/common.css";
import "@playerkit/ui/styles/hls.css";
import {
  type PlayerControls as PlayerControlsInterface,
  type Player,
} from "@playerkit/core";
import {
  formatPlayerTime,
  PlayerControls,
  getThemeConfig,
} from "@playerkit/ui";
import {
  useImperativeHandle,
  type CSSProperties,
  useCallback,
  forwardRef,
  useEffect,
  Suspense,
  useState,
  useMemo,
  lazy,
} from "react";

const YoutubePlayerLazy = lazy(() =>
  import("./youtube-player").then((m) => ({ default: m.YoutubePlayer })),
);

const Mp4PlayerLazy = lazy(() =>
  import("./mp4-player").then((m) => ({ default: m.Mp4Player })),
);

export const HlsPlayer = forwardRef<PlayerControlsInterface, HlsPlayerProps>(
  function HlsPlayer(props, ref) {
    const {
      src,
      type,
      root,
      live,
      style,
      poster,
      autoPlay,
      logLevel,
      className,
      startTime,
      centerZoneX,
      centerZoneY,
      tokenFetcher,
      tokenRefresher,
      onPlayerReady,
      seekStep = 10,
      theme = "default",
      customization,
      videoClassName,
      renderControls,
      themeOverrides,
      controls = true,
      keyboard = true,
      debugTouchZones = false,
      disableDevOptions = false,
      playbackRates = defaultPlaybackRates,
      ...videoProps
    } = props;

    const playerType = determinePlayerType(src, type);
    if (playerType === "youtube") {
      return (
        <Suspense fallback={null}>
          <YoutubePlayerLazy
            ref={ref as React.Ref<PlayerControlsInterface>}
            {...props}
          />
        </Suspense>
      );
    }
    if (playerType === "mp4") {
      return (
        <Suspense fallback={null}>
          <Mp4PlayerLazy
            ref={ref as React.Ref<PlayerControlsInterface>}
            {...props}
          />
        </Suspense>
      );
    }

    const { rootRef, videoRef, player, state } = useHlsPlayer({
      src,
      root,
      autoPlay,
      keyboard,
      startTime,
      tokenFetcher,
      tokenRefresher,
      logLevel,
      live,
      security: {
        disableDevOptions,
      },
    });

    const error = state?.error ?? null;

    // ─── Reusable Hooks Integration ───
    const isMobile = useCheckMobile();
    const isPortrait = useOrientation();
    const isMobilePortrait = isMobile && isPortrait;
    const { objectFit, setObjectFit } = usePlayerObjectFit(customization);
    const {
      seekFeedback,
      centerPlayFeedback,
      showSeekFeedback,
      showCenterPlayFeedback,
    } = usePlayerFeedback();

    useImperativeHandle(ref, () => player as Player, [player]);

    useEffect(() => {
      if (player) onPlayerReady?.(player);
    }, [onPlayerReady, player]);

    const activeTheme = theme || "default";
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

    const { seekRelative } = usePlayerRelativeSeek({
      player,
      state,
      seekStep,
      showSeekFeedback,
    });

    const triggerHaptic = useCallback(() => {
      if (isMobile && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, [isMobile]);

    const toggleStretch = useCallback(() => {
      setObjectFit((current) => (current === "fill" ? "contain" : "fill"));
      showControls();
    }, [showControls, setObjectFit]);

    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

    const toggleShortcuts = useCallback(() => {
      setIsShortcutsOpen((prev) => !prev);
    }, []);

    // ─── Keyboard Orchestrator Hook ───
    usePlayerKeyboard({
      player,
      state,
      seekRelative,
      showControls,
      toggleStretch,
      toggleShortcuts,
      enabled: keyboard,
    });

    // ─── Touch Gesture & Mobile Tap Orchestrator Hook ───
    const { handleTouchStart } = usePlayerTouchGestures({
      player,
      state,
      seekStep,
      showSeekFeedback,
      showCenterPlayFeedback,
      triggerHaptic,
      showControls,
      centerZoneX,
      centerZoneY,
    });

    // ─── Desktop Mouse Click Orchestrator Hook ───
    const { handleMouseClick } = usePlayerMouseInteractions({
      player,
      state,
      showControls,
      enabled: !isMobile,
    });

    // Bind touch/mouse gestures imperatively with passive: false to prevent passive listener warnings in browser
    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;

      const onGesture = (e: TouchEvent | MouseEvent) => {
        handleTouchStart(e);
      };

      root.addEventListener("touchstart", onGesture, { passive: false });
      if (isMobile) {
        root.addEventListener("mousedown", onGesture);
      }
      return () => {
        root.removeEventListener("touchstart", onGesture);
        if (isMobile) {
          root.removeEventListener("mousedown", onGesture);
        }
      };
    }, [handleTouchStart, isMobile]);

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

    const centerOverlayActive =
      controls &&
      !!state?.isReady &&
      (isMobile
        ? (customization?.mobile?.showCenterOverlay ?? false)
        : (customization?.showCenterOverlay ?? activeLayout.centerPlay));

    return (
      <div
        ref={rootRef}
        className={["pk-player", resolvedTheme.className, className]
          .filter(Boolean)
          .join(" ")}
        tabIndex={0}
        data-controls-visible={controlsVisible ? "true" : "false"}
        data-playing={state?.isPlaying ? "true" : "false"}
        data-live={state?.isLive ? "true" : "false"}
        data-object-fit={objectFit}
        data-mobile={isMobile ? "true" : "false"}
        onClick={handleMouseClick}
        onFocus={showControls}
        onMouseLeave={scheduleHideControls}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") showControls();
        }}
        style={
          {
            ...resolvedTheme.vars,
            ...themeOverrides,
            ...style,
          } as CSSProperties
        }
      >
        <div className="pk-player__clip">
          {/* Decoupled optimized Video Element and touch layer */}
          <VideoView
            ref={videoRef}
            videoClassName={videoClassName}
            poster={poster}
            objectFit={objectFit}
            {...videoProps}
          />

          {/* Reusable Security Lock Overlay */}
          <SecurityLockOverlay isActive={!!state?.isDevtoolsDetected} />

          {/* Modular Buffering Spinner */}
          <BufferingSpinner
            isBuffering={!!state?.isBuffering}
            hasError={hasFatalError}
          />

          {/* Modular Fatal Error Overlay */}
          <ErrorOverlay error={error} onRetry={() => player?.retry()} />

          {/* Modular Seek Feedback Overlay */}
          <SeekFeedbackOverlay
            feedback={seekFeedback}
            isMobilePortrait={isMobilePortrait && centerOverlayActive}
          />

          {/* Modular Center play/pause Feedback (Mobile) */}
          <CenterPlayFeedback feedback={centerPlayFeedback} />

          {/* Visual Touch Diagnostic Overlay */}
          <TouchDiagnosticOverlay
            isActive={debugTouchZones}
            centerZoneX={centerZoneX}
            centerZoneY={centerZoneY}
          />

          {/* Action HUD Feedback Overlay */}
          <HudFeedback state={state} />

          <div className="pk-player__gradient" />
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
          hasError={!!error}
          isPlaying={!!state?.isPlaying}
          seekStep={seekStep}
          controlsVisible={controlsVisible}
          showCenterOverlay={centerOverlayActive}
          centerOverlayGap={customization?.centerOverlayGap}
          onPlayToggle={() => void player?.togglePlay()}
          onSeek={seekRelative}
          isLive={!!state?.isLive}
          dvr={state?.dvr}
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

        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />
      </div>
    );
  },
);
