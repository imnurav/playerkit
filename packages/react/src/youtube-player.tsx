import { usePlayerMouseInteractions } from "./hooks/usePlayerMouseInteractions";
import { usePlayerTouchGestures } from "./hooks/usePlayerTouchGestures";
import { useControlsVisibility } from "./hooks/useControlsVisibility";
import { useYoutubeIframeScale } from "./hooks/useYoutubeIframeScale";
import { usePlayerRelativeSeek } from "./hooks/usePlayerRelativeSeek";
import { YoutubeVideoView } from "./components/YoutubeVideoView";
import { usePlayerObjectFit } from "./hooks/usePlayerObjectFit";
import { PlayerControls, getThemeConfig } from "@playerkit/ui";
import { usePlayerKeyboard } from "./hooks/usePlayerKeyboard";
import { usePlayerTimeline } from "./hooks/usePlayerTimeline";
import { usePlayerFeedback } from "./hooks/usePlayerFeedback";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { CenterOverlay } from "./components/CenterOverlay";
import { useCheckMobile } from "./hooks/useCheckMobile";
import { useOrientation } from "./hooks/useOrientation";
import { HudFeedback } from "./components/HudFeedback";
import { determinePlayerType } from "./utils/helpers";
import { useYoutubePlayer } from "./useYoutubePlayer";
import { LiveBadge } from "./components/LiveBadge";
import { defaultPlaybackRates } from "./constants";

import "@playerkit/ui/styles/common.css";
import "@playerkit/ui/styles/youtube.css";

const HlsPlayerLazy = lazy(() =>
  import("./hls-player").then((m) => ({ default: m.HlsPlayer })),
);

const Mp4PlayerLazy = lazy(() =>
  import("./mp4-player").then((m) => ({ default: m.Mp4Player })),
);
import {
  extractYoutubeId,
  type PlayerControls as PlayerControlsInterface,
} from "@playerkit/core";
import type { HlsPlayerProps, YoutubePlayerProps } from "./types";
import {
  lazy,
  useRef,
  useMemo,
  useState,
  Suspense,
  useEffect,
  forwardRef,
  useCallback,
  type CSSProperties,
  useImperativeHandle,
} from "react";

/**
 * YoutubePlayer — highly performant, modularized React player component wrapper.
 * Interacts seamlessly with our custom controls UI overlay and embeds security checks.
 */
export const YoutubePlayer = forwardRef<
  PlayerControlsInterface,
  YoutubePlayerProps
>(function YoutubePlayer(props, ref) {
  const {
    src,
    type,
    className,
    style,
    controls = true,
    autoPlay,
    startTime,
    keyboard = true,
    seekStep = 10,
    theme = "default",
    customization,
    themeOverrides,
    playbackRates = defaultPlaybackRates,
    disableDevOptions = false,
    centerZoneX,
    centerZoneY,
    onPlayerReady,
    logLevel,
    debugTouchZones = false,
    poster,
    live,
  } = props;

  const playerType = determinePlayerType(src, type);
  if (playerType === "hls") {
    return (
      <Suspense fallback={null}>
        <HlsPlayerLazy
          ref={ref as React.Ref<PlayerControlsInterface>}
          {...(props as unknown as HlsPlayerProps)}
        />
      </Suspense>
    );
  }
  if (playerType === "mp4") {
    return (
      <Suspense fallback={null}>
        <Mp4PlayerLazy
          ref={ref as React.Ref<PlayerControlsInterface>}
          {...(props as unknown as HlsPlayerProps)}
        />
      </Suspense>
    );
  }

  const clipRef = useRef<HTMLDivElement>(null!);
  const rootRef = useRef<HTMLDivElement>(null!);

  // Core Engine Integration Hook
  const { player, state } = useYoutubePlayer({
    src,
    autoPlay,
    startTime,
    security: { disableDevOptions },
    containerRef: clipRef,
    fullscreenRef: rootRef,
    logLevel,
    live,
  });

  const error = state?.error ?? null;

  // ─── Playback & Poster State Tracking ───
  const [hasPlayStarted, setHasPlayStarted] = useState(false);
  const [localSyncCompleted, setLocalSyncCompleted] = useState(false);
  const hasLiveSynced =
    (state?.initialSyncCompleted ?? false) || localSyncCompleted;

  useEffect(() => {
    setHasPlayStarted(false);
    setLocalSyncCompleted(false);
  }, [src]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (state?.isPlaying) {
      setHasPlayStarted(true);
      // Fallback timer: force poster to hide within 800ms (VOD) or 1800ms (Live)
      // to let active DVR probe settle.
      const delay = state?.isLive ? 1800 : 800;
      const timer = setTimeout(() => {
        setLocalSyncCompleted(true);
      }, delay);
      cleanup = () => clearTimeout(timer);
    }
    return cleanup;
  }, [state?.isPlaying, state?.isLive]);

  const videoId = useMemo(() => extractYoutubeId(src) ?? "", [src]);
  const posterUrl = useMemo(() => {
    if (poster) return poster;
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  }, [poster, videoId]);

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

  const [hasEnded, setHasEnded] = useState(false);

  // Dynamic Youtube Iframe Vertical Scaling (for Fill Fit Mode) Hook
  useYoutubeIframeScale(rootRef, objectFit, state?.isReady);

  // Handle end of video to fade out YouTube suggestions
  useEffect(() => {
    if (!player) return;

    const onEnded = () => setHasEnded(true);
    const onPlay = () => setHasEnded(false);
    const onSourceChange = () => setHasEnded(false);

    player.on("ended", onEnded);
    player.on("play", onPlay);
    player.on("sourcechange", onSourceChange);

    return () => {
      player.off("ended", onEnded);
      player.off("play", onPlay);
      player.off("sourcechange", onSourceChange);
    };
  }, [player]);

  useImperativeHandle(ref, () => player as PlayerControlsInterface, [player]);

  useEffect(() => {
    if (player) onPlayerReady?.(player);
  }, [onPlayerReady, player]);

  const activeTheme = theme || "default";
  const resolvedTheme = useMemo(
    () => getThemeConfig(activeTheme),
    [activeTheme],
  );

  const isSyncing = !!state?.isPlaying && (!hasPlayStarted || !hasLiveSynced);

  const resolvedState = useMemo(() => {
    if (!state) return null;
    // For live streams, only force live edge styling during initial sync if it is a non-DVR stream
    if (state.isLive && isSyncing && !state.dvr) {
      const liveEdge = Math.max(0, state.duration - 25);
      return {
        ...state,
        currentTime: liveEdge,
        isAtLiveEdge: true,
        liveLatency: 0,
        seekableStart: 0,
        seekableEnd: liveEdge,
      };
    }
    return state;
  }, [state, isSyncing]);

  // Decoupled Timeline Tracking Hook
  const { progress } = usePlayerTimeline(resolvedState);

  // Decoupled Controls Visibility Orchestrator Hook
  const {
    areControlsVisible,
    isSettingsOpenRef,
    showControls,
    scheduleHideControls,
  } = useControlsVisibility({
    state: resolvedState,
    theme: activeTheme,
    autoHideDelay: resolvedTheme.controls.autoHideDelay,
  });

  const { seekRelative } = usePlayerRelativeSeek({
    player,
    seekStep,
    showSeekFeedback,
  });

  const handleSeekToLive = useCallback(() => {
    player?.seekToLive();
    showControls();
  }, [player, showControls]);

  const handlePlayToggle = useCallback(() => {
    void player?.togglePlay();
  }, [player]);

  const triggerHaptic = useCallback(() => {
    if (isMobile && navigator.vibrate) navigator.vibrate(10);
  }, [isMobile]);

  const toggleStretch = useCallback(() => {
    setObjectFit((current) => (current === "fill" ? "contain" : "fill"));
    showControls();
  }, [showControls, setObjectFit]);

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const toggleShortcuts = useCallback(() => {
    setIsShortcutsOpen((prev) => !prev);
  }, []);

  // Keyboard Orchestrator Hook
  usePlayerKeyboard({
    player,
    state,
    seekRelative,
    showControls,
    toggleStretch,
    toggleShortcuts,
    enabled: keyboard,
  });

  // Touch Gestures & Tapping Interceptor Hook
  const { handleTouchStart } = usePlayerTouchGestures({
    player,
    seekStep,
    showSeekFeedback,
    showCenterPlayFeedback,
    triggerHaptic,
    showControls,
    centerZoneX,
    centerZoneY,
  });

  // Desktop Mouse Click Orchestrator Hook
  const { handleMouseClick } = usePlayerMouseInteractions({
    player,
    isReady: !!resolvedState?.isReady,
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

  const controlsVisible =
    !isSyncing && (areControlsVisible || !resolvedState?.isPlaying);
  const hasFatalError = !!error?.fatal;

  const activeLayout = isMobile
    ? resolvedTheme.controls.mobile
    : resolvedTheme.controls.desktop;

  const centerOverlayActive =
    controls &&
    (isMobile
      ? (customization?.mobile?.showCenterOverlay ?? false)
      : (customization?.showCenterOverlay ?? activeLayout.centerPlay));

  return (
    <div
      tabIndex={0}
      ref={rootRef}
      onFocus={showControls}
      onClick={handleMouseClick}
      data-object-fit={objectFit}
      onMouseLeave={scheduleHideControls}
      data-ended={hasEnded ? "true" : "false"}
      data-yt-ready={resolvedState?.isReady ? "true" : "false"}
      data-playing={resolvedState?.isPlaying ? "true" : "false"}
      data-controls-visible={controlsVisible ? "true" : "false"}
      data-mobile={isMobile ? "true" : "false"}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") showControls();
      }}
      className={["pk-player", resolvedTheme.className, className]
        .filter(Boolean)
        .join(" ")}
      style={
        { ...resolvedTheme.vars, ...themeOverrides, ...style } as CSSProperties
      }
    >
      {/* Memoized video clip and overlay view */}
      <YoutubeVideoView
        ref={clipRef}
        isDevtoolsDetected={resolvedState?.isDevtoolsDetected}
        isBuffering={
          hasPlayStarted && (!state?.isReady || !!state?.isBuffering)
        }
        error={error}
        player={player}
        videoId={videoId}
        posterUrl={posterUrl}
        objectFit={objectFit}
        centerZoneX={centerZoneX}
        centerZoneY={centerZoneY}
        seekFeedback={seekFeedback}
        showPoster={!hasPlayStarted}
        debugTouchZones={debugTouchZones}
        centerPlayFeedback={centerPlayFeedback}
        isMobilePortrait={isMobilePortrait && centerOverlayActive}
      />

      {/* Action HUD Feedback Overlay */}
      <HudFeedback state={resolvedState} />

      {/* Seek-to-Live Badge */}
      <LiveBadge
        isLive={!!resolvedState?.isLive}
        hasError={hasFatalError}
        controlsVisible={controlsVisible}
        isAtLiveEdge={!!resolvedState?.isAtLiveEdge}
        onSeekToLive={handleSeekToLive}
      />

      {/* Center Overlay */}
      <CenterOverlay
        hasError={hasFatalError}
        isPlaying={!!resolvedState?.isPlaying}
        isBuffering={
          hasPlayStarted && (!state?.isReady || !!state?.isBuffering)
        }
        seekStep={seekStep}
        controlsVisible={controlsVisible}
        showCenterOverlay={centerOverlayActive}
        centerOverlayGap={customization?.centerOverlayGap}
        onPlayToggle={handlePlayToggle}
        onSeek={seekRelative}
        isLive={!!resolvedState?.isLive}
        dvr={resolvedState?.dvr}
      />

      {/* Full Control Bar */}
      {controls && !hasFatalError ? (
        <PlayerControls
          state={resolvedState}
          theme={activeTheme}
          player={player as PlayerControlsInterface}
          buffered={0}
          progress={progress}
          isMobile={isMobile}
          seekRelative={seekRelative}
          playbackRates={playbackRates}
          controlsVisible={controlsVisible}
          customization={customization}
          objectFit={objectFit}
          onObjectFitChange={setObjectFit}
          onControlsInteraction={showControls}
          onSettingsOpenChange={(open: boolean) => {
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
});
