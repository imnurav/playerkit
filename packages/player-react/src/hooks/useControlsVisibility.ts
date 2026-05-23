import { useState, useRef, useCallback, useEffect } from "react";
import type { PlayerSnapshot } from "@nurav/player-core";

export type UseControlsVisibilityOptions = {
  state: PlayerSnapshot | null;
  theme: string;
  autoHideDelay: number;
};

export function useControlsVisibility({
  state,
  theme,
  autoHideDelay,
}: UseControlsVisibilityOptions) {
  const hideTimerRef = useRef<number | null>(null);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const isSettingsOpenRef = useRef(false);

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
    }, autoHideDelay);
  }, [clearHideTimer, state?.isPlaying, autoHideDelay]);

  const showControls = useCallback(() => {
    setAreControlsVisible(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    showControls();
    return () => clearHideTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.isPlaying, theme]);

  // Handle timer cleanup on unmount
  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  return {
    areControlsVisible,
    isSettingsOpenRef,
    showControls,
    scheduleHideControls,
    clearHideTimer,
  };
}
