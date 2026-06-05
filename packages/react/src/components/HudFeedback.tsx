import {
  IconPlay,
  IconPause,
  IconVolumeLow,
  IconVolumeHigh,
  IconVolumeOff,
  IconSpeed,
} from "@playerkit/ui";
import type { PlayerSnapshot } from "@playerkit/core";
import { memo, useEffect, useRef, useState } from "react";

export type HudFeedbackProps = {
  state: PlayerSnapshot | null;
};

type HudEvent = {
  type: "volume" | "speed" | "mute" | "play" | "pause";
  value?: string;
  id: number;
};

export const HudFeedback = memo(function HudFeedback({
  state,
}: HudFeedbackProps) {
  const [hudEvent, setHudEvent] = useState<HudEvent | null>(null);

  const prevVolumeRef = useRef<number | null>(null);
  const prevMutedRef = useRef<boolean | null>(null);
  const prevSpeedRef = useRef<number | null>(null);
  const prevPlayingRef = useRef<boolean | null>(null);

  // Initialize refs on first non-null state to prevent HUD flashing on mount
  const isInitializedRef = useRef(false);
  // Don't show play/pause icons until the video has actually played at least once
  const hasEverPlayedRef = useRef(false);
  const prevSrcRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state) return;
    // Never show HUD feedback when the player is in an error state
    if (state.error) return;

    // Reset all tracking when the source changes (new stream, fresh slate)
    if (prevSrcRef.current !== null && prevSrcRef.current !== state.src) {
      isInitializedRef.current = false;
      hasEverPlayedRef.current = false;
      prevVolumeRef.current = null;
      prevMutedRef.current = null;
      prevSpeedRef.current = null;
      prevPlayingRef.current = null;
      setHudEvent(null);
    }
    prevSrcRef.current = state.src;

    if (!isInitializedRef.current) {
      prevVolumeRef.current = state.volume;
      prevMutedRef.current = state.isMuted;
      prevSpeedRef.current = state.playbackRate;
      prevPlayingRef.current = state.isPlaying;
      isInitializedRef.current = true;
      return;
    }

    // 1. Detect Play/Pause Toggle — only after video is ready and has played once
    if (prevPlayingRef.current !== state.isPlaying) {
      if (state.isPlaying && state.isReady) hasEverPlayedRef.current = true;

      if (hasEverPlayedRef.current) {
        setHudEvent({
          type: state.isPlaying ? "play" : "pause",
          id: Date.now(),
        });
      }
    }
    prevPlayingRef.current = state.isPlaying;

    // 2. Detect Speed Change
    if (prevSpeedRef.current !== state.playbackRate) {
      setHudEvent({
        type: "speed",
        value: `${state.playbackRate}x`,
        id: Date.now(),
      });
    }
    prevSpeedRef.current = state.playbackRate;

    // 3. Detect Muted State Change
    if (prevMutedRef.current !== state.isMuted) {
      setHudEvent({
        type: state.isMuted ? "mute" : "volume",
        value: state.isMuted ? "Muted" : `${Math.round(state.volume * 100)}%`,
        id: Date.now(),
      });
    }
    // 4. Detect Volume Level Change
    else if (prevVolumeRef.current !== state.volume && !state.isMuted) {
      setHudEvent({
        type: "volume",
        value: `${Math.round(state.volume * 100)}%`,
        id: Date.now(),
      });
    }
    prevVolumeRef.current = state.volume;
    prevMutedRef.current = state.isMuted;
  }, [state]);

  // Auto-remove HUD element from DOM after animation completes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (hudEvent) {
      timer = setTimeout(() => {
        setHudEvent(null);
      }, 750); // Matches the 750ms animation duration
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hudEvent]);

  if (!hudEvent) return null;

  // Select corresponding icon based on type
  const renderIcon = () => {
    switch (hudEvent.type) {
      case "play":
        return <IconPlay />;
      case "pause":
        return <IconPause />;
      case "mute":
        return <IconVolumeOff />;
      case "speed":
        return <IconSpeed />;
      case "volume":
      default:
        if (state && state.volume < 0.5) {
          return <IconVolumeLow />;
        }
        return <IconVolumeHigh />;
    }
  };

  // Human-friendly label for HUD types
  const renderLabel = () => {
    if (hudEvent.value) return hudEvent.value;

    switch (hudEvent.type) {
      case "play":
        return "Play";
      case "pause":
        return "Pause";
      default:
        return "";
    }
  };

  return (
    <div className="pk-hud-feedback" key={hudEvent.id} aria-live="polite">
      {renderIcon()}
      {renderLabel() && <span>{renderLabel()}</span>}
    </div>
  );
});

HudFeedback.displayName = "HudFeedback";
