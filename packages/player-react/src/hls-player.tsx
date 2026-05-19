import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type VideoHTMLAttributes,
} from "react";

import type { Player, PlayerSnapshot } from "@varun/player-core";
import {
  getPlayerTheme,
  type PlayerThemeName,
  type PlayerThemeVars,
} from "@varun/player-themes";
import {
  formatPlayerTime,
  IconForward,
  IconPause,
  IconPlay,
  IconRewind,
  PlayerControls,
  playerStyles,
  usePlayerControlPreset,
} from "@varun/player-ui";

import { useHlsPlayer, type UseHlsPlayerOptions } from "./use-hls-player";

type SeekFeedback = {
  side: "left" | "right";
  id: number;
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
  Omit<VideoHTMLAttributes<HTMLVideoElement>, "autoPlay" | "className" | "controls" | "src"> & {
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
    keyboard,
    root,
    startTime,
    ...videoProps
  },
  ref,
) {
  const { rootRef, videoRef, player, state } = useHlsPlayer({
    src,
    autoPlay,
    keyboard: keyboard ?? true,
    root,
    startTime,
  });
  const lastTapRef = useRef<{ at: number; side: "left" | "right" } | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [seekFeedback, setSeekFeedback] = useState<SeekFeedback | null>(null);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const progress = useMemo(() => {
    if (!state?.duration) return 0;

    return Math.min((state.currentTime / state.duration) * 100, 100);
  }, [state?.currentTime, state?.duration]);

  const buffered = useMemo(() => {
    return state?.bufferedPercent || 0;
  }, [state?.bufferedPercent]);

  useImperativeHandle(ref, () => player as Player, [player]);

  useEffect(() => {
    if (player) {
      onPlayerReady?.(player);
    }
  }, [onPlayerReady, player]);

  useEffect(() => {
    showControls();

    return () => {
      clearHideTimer();
    };
  }, [state?.isPlaying, theme]);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHideControls = () => {
    clearHideTimer();

    if (!state?.isPlaying || isSettingsOpen) {
      return;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setAreControlsVisible(false);
    }, resolvedTheme.controls.autoHideDelay);
  };

  const showControls = () => {
    setAreControlsVisible(true);
    scheduleHideControls();
  };

  const showSeekFeedback = (side: "left" | "right") => {
    const feedback = { side, id: Date.now() };
    setSeekFeedback(feedback);

    window.setTimeout(() => {
      setSeekFeedback((current) => (current?.id === feedback.id ? null : current));
    }, 520);
  };

  const seekRelative = (direction: -1 | 1) => {
    if (!player || !state) return;

    player.seek(state.currentTime + direction * seekStep);
    showSeekFeedback(direction === -1 ? "left" : "right");
  };

  const handleDoubleTap = (event: PointerEvent<HTMLButtonElement>, side: "left" | "right") => {
    if (event.pointerType === "mouse") return;

    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap && lastTap.side === side && now - lastTap.at < 320) {
      event.preventDefault();
      seekRelative(side === "left" ? -1 : 1);
      lastTapRef.current = null;
      return;
    }

    lastTapRef.current = { at: now, side };
    showControls();
  };

  const handlePlayerFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.target)) {
      showControls();
    }
  };

  const resolvedTheme = getPlayerTheme(theme);
  const activeControlPreset = usePlayerControlPreset(resolvedTheme.controls);
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
      className={["vhp-player", resolvedTheme.className, className].filter(Boolean).join(" ")}
      tabIndex={0}
      data-controls-visible={areControlsVisible || !state?.isPlaying || isSettingsOpen ? "true" : "false"}
      data-playing={state?.isPlaying ? "true" : "false"}
      onClick={showControls}
      onFocus={handlePlayerFocus}
      onMouseLeave={scheduleHideControls}
      onPointerMove={showControls}
      onTouchStart={showControls}
      style={{ ...resolvedTheme.vars, ...themeOverrides } as CSSProperties}
    >
      <style>{playerStyles}</style>

      <video
        ref={videoRef}
        className={["vhp-video", videoClassName].filter(Boolean).join(" ")}
        controls={false}
        playsInline
        poster={poster}
        {...videoProps}
      />

      <div className="vhp-tap-layer" aria-hidden="true">
        <button
          type="button"
          className="vhp-tap-zone vhp-tap-zone-left"
          tabIndex={-1}
          onDoubleClick={() => seekRelative(-1)}
          onPointerUp={(event) => handleDoubleTap(event, "left")}
        />
        <button
          type="button"
          className="vhp-tap-zone vhp-tap-zone-right"
          tabIndex={-1}
          onDoubleClick={() => seekRelative(1)}
          onPointerUp={(event) => handleDoubleTap(event, "right")}
        />
      </div>

      {state?.isBuffering ? (
        <div className="vhp-buffering" aria-label="Buffering">
          <span />
        </div>
      ) : null}

      {seekFeedback ? (
        <div className={`vhp-seek-feedback vhp-seek-feedback-${seekFeedback.side}`}>
          {seekFeedback.side === "left" ? <IconRewind /> : <IconForward />}
          <span>{seekStep}s</span>
        </div>
      ) : null}

      <div className="vhp-gradient" />

      {renderControls ? renderControls(controlsProps) : null}

      {controls && activeControlPreset.centerPlay ? (
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
          buffered={buffered}
          desktopPreset={resolvedTheme.controls.desktop}
          mobilePreset={resolvedTheme.controls.mobile}
          onControlsInteraction={showControls}
          onSettingsOpenChange={setIsSettingsOpen}
          playbackRates={playbackRates}
          player={player}
          progress={progress}
          seekRelative={seekRelative}
          state={state}
        />
      ) : null}
    </div>
  );
});
