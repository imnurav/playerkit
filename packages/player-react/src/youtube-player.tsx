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
import type { YoutubePlayer as YoutubePlayerEngine } from "@nurav/player-core";
import { useYoutubePlayer } from "./useYoutubePlayer";
import type { SeekFeedbackType } from "./components/SeekFeedbackOverlay";
import { SeekFeedbackOverlay } from "./components/SeekFeedbackOverlay";
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

export type YoutubePlayerProps = {
    src: string;
    className?: string;
    style?: React.CSSProperties;
    controls?: boolean;
    autoPlay?: boolean;
    startTime?: number;
    keyboard?: boolean;
    theme?: string;
    customization?: Record<string, any>;
    themeOverrides?: Record<string, string>;
    playbackRates?: number[];
    seekStep?: number;
    disableDevOptions?: boolean;
    onPlayerReady?: (player: YoutubePlayerEngine) => void;
};

const asPlayer = (p: any) => p as any;

export const YoutubePlayer = forwardRef<
    YoutubePlayerEngine,
    YoutubePlayerProps
>(function YoutubePlayer(
    {
        src,
        className,
        style,
        controls = true,
        autoPlay,
        startTime,
        keyboard = true,
        seekStep = 10,
        theme = "kgs",
        customization,
        themeOverrides,
        playbackRates = defaultPlaybackRates,
        disableDevOptions = false,
        onPlayerReady,
    },
    ref,
) {
    const clipRef = useRef<HTMLDivElement>(null!);
    const rootRef = useRef<HTMLDivElement>(null!);
    const { player, state, error } = useYoutubePlayer({
        src,
        autoPlay,
        startTime,
        security: { disableDevOptions },
        containerRef: clipRef,
        fullscreenRef: rootRef,
    });

    const seekAccumulatedRef = useRef<{
        direction: -1 | 1;
        count: number;
        timer: number | null;
    }>({ direction: 1, count: 0, timer: null });

    const [seekFeedback, setSeekFeedback] = useState<SeekFeedbackType | null>(
        null,
    );
    const [centerPlayFeedback, setCenterPlayFeedback] =
        useState<CenterPlayFeedbackType | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [objectFit, setObjectFit] = useState<"contain" | "cover" | "fill">(
        "contain",
    );

    useEffect(() => {
        const checkMobile = () => {
            const hasTouch =
                "ontouchstart" in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 760;
            setIsMobile(isSmallScreen || (hasTouch && window.innerWidth <= 1024));
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        return () => {
            const acc = seekAccumulatedRef.current;
            if (acc.timer) clearTimeout(acc.timer);
        };
    }, []);

    useImperativeHandle(ref, () => player as YoutubePlayerEngine, [player]);

    useEffect(() => {
        if (player) onPlayerReady?.(player);
    }, [onPlayerReady, player]);

    const activeTheme = (theme === "kgs" ? "kgs" : theme) as any;
    const resolvedTheme = useMemo(
        () => getThemeConfig(activeTheme),
        [activeTheme],
    );

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
        if (isMobile && navigator.vibrate) navigator.vibrate(10);
    }, [isMobile]);

    const seekRelative = useCallback(
        (direction: -1 | 1) => {
            if (!player || !state) return;
            const acc = seekAccumulatedRef.current;
            if (acc.direction !== direction) acc.count = 0;
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

    usePlayerKeyboard({
        player: asPlayer(player),
        state,
        seekRelative,
        showControls,
        toggleStretch,
        enabled: keyboard,
    });

    const { handleTouchStart, handleMouseClick } = usePlayerGestures({
        player: asPlayer(player),
        state,
        isMobile,
        seekStep,
        showSeekFeedback,
        showCenterPlayFeedback,
        triggerHaptic,
        showControls,
    });

    const controlsVisible = areControlsVisible || !state?.isPlaying;
    const hasFatalError = !!error?.fatal;

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
            data-yt-ready={state?.isReady ? "true" : "false"}
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
                {/* YouTube iframe injected here by YoutubeManager */}
                <div ref={clipRef} data-youtube-clip style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

                {/* Buffering Spinner */}
                <BufferingSpinner
                    isBuffering={!!state?.isBuffering}
                    hasError={hasFatalError}
                />

                {/* Error Overlay */}
                <ErrorOverlay error={error} onRetry={() => player?.retry()} />

                {/* Seek Feedback */}
                <SeekFeedbackOverlay feedback={seekFeedback} />

                {/* Center Play/Pause Feedback */}
                <CenterPlayFeedback feedback={centerPlayFeedback} />

                <div className="vp-player__gradient" />
            </div>

            {/* Seek-to-Live Badge */}
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

            {/* Center Overlay */}
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

            {/* Full Control Bar */}
            {controls && !hasFatalError ? (
                <PlayerControls
                    state={state}
                    theme={activeTheme}
                    player={asPlayer(player)}
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
                    onSettingsOpenChange={(open: boolean) => {
                        isSettingsOpenRef.current = open;
                    }}
                />
            ) : null}
        </div>
    );
});