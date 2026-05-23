import type { Player, PlayerSnapshot } from "@varun/player-core";
import { useRef, useEffect, useCallback } from "react";

export type UsePlayerGesturesOptions = {
  player: Player | null;
  state: PlayerSnapshot | null;
  isMobile: boolean;
  seekStep: number;
  showSeekFeedback: (side: "left" | "right", seconds: number) => void;
  showCenterPlayFeedback: (action: "play" | "pause") => void;
  triggerHaptic: () => void;
  showControls: () => void;
  /** Proportion of the player width (0-1) to consider the center zone for tap-to-play/pause. Default: { start: 0.4, end: 0.6 } (20% middle strip) */
  centerZoneX?: { start: number; end: number };
  /** Proportion of the player height (0-1) to consider the center zone for tap-to-play/pause. Default: { start: 0.35, end: 0.65 } (30% middle strip) */
  centerZoneY?: { start: number; end: number };
};

const DOUBLE_TAP_WINDOW = 320;
const SEEK_ACCUMULATOR_TIMEOUT = 600;

export function usePlayerGestures({
  player,
  state,
  isMobile,
  seekStep,
  showSeekFeedback,
  showCenterPlayFeedback,
  triggerHaptic,
  showControls,
  centerZoneX = { start: 0.4, end: 0.6 },
  centerZoneY = { start: 0.35, end: 0.65 },
}: UsePlayerGesturesOptions) {
  const lastTapRef = useRef<{ at: number; x: number } | null>(null);
  const seekCountRef = useRef<number>(0);
  const lastSeekSideRef = useRef<-1 | 1 | null>(null);
  const seekCountTimerRef = useRef<number | null>(null);
  const isTouchHandledRef = useRef(false);
  const pendingPlayTimerRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (seekCountTimerRef.current) {
        clearTimeout(seekCountTimerRef.current);
      }
      if (pendingPlayTimerRef.current) {
        clearTimeout(pendingPlayTimerRef.current);
      }
    };
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Skip overlay control interactions
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

      // ─── Double Tap to Seek ───
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

      // ─── Center Zone Single Tap to Play/Pause ───
      const y = touch.clientY - rect.top;
      const isCenterX =
        x > rect.width * centerZoneX.start && x < rect.width * centerZoneX.end;
      const isCenterY =
        y > rect.height * centerZoneY.start &&
        y < rect.height * centerZoneY.end;
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
      const y = event.clientY - rect.top;
      const isCenterX =
        x > rect.width * centerZoneX.start && x < rect.width * centerZoneX.end;
      const isCenterY =
        y > rect.height * centerZoneY.start &&
        y < rect.height * centerZoneY.end;
      if (isCenterX && isCenterY) {
        if (!player || !state) return;
        const wasPlaying = state.isPlaying;
        void player.togglePlay();
        showCenterPlayFeedback(wasPlaying ? "pause" : "play");
      }
    },
    [
      showControls,
      player,
      state,
      isMobile,
      showCenterPlayFeedback,
      centerZoneX,
      centerZoneY,
    ],
  );

  return {
    handleTouchStart,
    handleMouseClick,
  };
}
