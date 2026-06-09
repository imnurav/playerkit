import { type PlayerControls as PlayerControlsInterface } from "@playerkit/core";
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
import { HudFeedback } from "./components/HudFeedback";
import { determinePlayerType } from "./utils/helpers";
import { LiveBadge } from "./components/LiveBadge";
import { VideoView } from "./components/VideoView";
import { defaultPlaybackRates } from "./constants";
import { useMp4Player } from "./useMp4Player";
import type { Mp4PlayerProps } from "./types";
import "@playerkit/ui/styles/common.css";
import "@playerkit/ui/styles/mp4.css";
import {
    PlayerControls,
    getThemeConfig,
    formatPlayerTime,
} from "@playerkit/ui";
import {
    useMemo,
    useEffect,
    forwardRef,
    useCallback,
    useState,
    type CSSProperties,
    useImperativeHandle,
} from "react";

const YoutubePlayerLazy = lazy(() =>
    import("./youtube-player").then((m) => ({ default: m.YoutubePlayer })),
);

import { lazy, Suspense } from "react";

/**
 * Mp4Player — progressive MP4 React component.
 *
 * Wraps the headless `Mp4Player` engine from `@playerkit/core` behind the
 * same controls UI as the HLS and YouTube players. Follows the same
 * component pattern as `HlsPlayer` — same hooks, same overlay structure,
 * same forwardRef surface — so the rest of the system is engine-agnostic.
 *
 * Differences vs HlsPlayer:
 *  - Loads `mp4.css` instead of `hls.css` (visual rules are identical).
 *  - No live / DVR / latency config — progressive MP4 is always VOD.
 *  - Single rendition — the quality menu in the settings panel is hidden
 *    automatically because `state.qualities` stays empty.
 */
export const Mp4Player = forwardRef<PlayerControlsInterface, Mp4PlayerProps>(
    function Mp4Player(props, ref) {
        const {
            src,
            type,
            root,
            style,
            poster,
            autoPlay,
            logLevel,
            className,
            startTime,
            centerZoneX,
            centerZoneY,
            tokenFetcher,
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

        // If the caller explicitly asked for a different engine, delegate.
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

        const { rootRef, videoRef, player, state } = useMp4Player({
            src,
            root,
            autoPlay,
            keyboard,
            startTime,
            tokenFetcher,
            logLevel,
            security: {
                disableDevOptions,
            },
        });

        const error = state?.error ?? null;

        // ─── Reusable Hooks Integration ───
        const isMobile = useCheckMobile();
        const { objectFit, setObjectFit } = usePlayerObjectFit(customization);
        const {
            seekFeedback,
            centerPlayFeedback,
            showSeekFeedback,
            showCenterPlayFeedback,
        } = usePlayerFeedback();

        useImperativeHandle(ref, () => player as PlayerControlsInterface, [player]);

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
        });

        // Bind touchstart imperatively with passive: false to prevent passive listener warnings in browser
        useEffect(() => {
            const root = rootRef.current;
            if (!root) return;

            const onTouch = (e: TouchEvent) => {
                handleTouchStart(e);
            };

            root.addEventListener("touchstart", onTouch, { passive: false });
            return () => {
                root.removeEventListener("touchstart", onTouch);
            };
        }, [handleTouchStart]);

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
                className={["pk-player", resolvedTheme.className, className]
                    .filter(Boolean)
                    .join(" ")}
                tabIndex={0}
                data-controls-visible={controlsVisible ? "true" : "false"}
                data-playing={state?.isPlaying ? "true" : "false"}
                data-live="false"
                data-object-fit={objectFit}
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
                    <SeekFeedbackOverlay feedback={seekFeedback} />

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

                {/* LiveBadge is kept in the tree for parity, but always hidden via
            the data-live="false" attribute since MP4 sources are never live. */}
                <LiveBadge
                    isLive={false}
                    hasError={hasFatalError}
                    isAtLiveEdge={false}
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
                    hasError={!!error}
                    isPlaying={!!state?.isPlaying}
                    seekStep={seekStep}
                    controlsVisible={controlsVisible}
                    showCenterOverlay={
                        controls &&
                        !!state?.isReady &&
                        (customization?.showCenterOverlay ?? activeLayout.centerPlay)
                    }
                    centerOverlayGap={customization?.centerOverlayGap}
                    onPlayToggle={() => void player?.togglePlay()}
                    onSeek={seekRelative}
                    isLive={false}
                    dvr={false}
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
