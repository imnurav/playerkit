import type { UsePlayerTouchGesturesOptions } from "../types";
import { useRef, useEffect, useCallback } from "react";

const DOUBLE_TAP_WINDOW = 320;
const SEEK_ACCUMULATOR_TIMEOUT = 600;

/**
 * Hook to manage high-performance Touch Gestures specifically for mobile/touch screens:
 * - Single-tap in the center band toggles play/pause with touch controls display.
 * - Double-tap in left/right zones seeks backward/forward with dynamic haptics and overlays.
 */
export function usePlayerTouchGestures({
  player,
  seekStep,
  showSeekFeedback,
  showCenterPlayFeedback,
  triggerHaptic,
  showControls,
  centerZoneX = { start: 0.4, end: 0.6 },
  centerZoneY = { start: 0.35, end: 0.65 },
}: UsePlayerTouchGesturesOptions) {
  const lastTapRef = useRef<{ at: number; x: number } | null>(null);
  const seekCountRef = useRef<number>(0);
  const lastSeekSideRef = useRef<-1 | 1 | null>(null);
  const seekCountTimerRef = useRef<number | null>(null);
  const pendingPlayTimerRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (seekCountTimerRef.current) clearTimeout(seekCountTimerRef.current);
      if (pendingPlayTimerRef.current)
        clearTimeout(pendingPlayTimerRef.current);
    };
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      // Skip touch events on UI elements and settings anchors
      if (
        target.closest("[data-pk-controls]") ||
        target.closest(".pk-settings-anchor") ||
        target.closest(".pk-top-controls__right") ||
        target.closest(".pk-settings-backdrop") ||
        target.closest(".pk-settings-sheet") ||
        target.closest(".pk-settings-panel") ||
        target.closest(".pk-settings-dropdown")
      )
        return;

      showControls();

      // Prevent browser default zoom and delayed click events
      event.preventDefault();

      const touch = event.touches[0];
      const currentTarget = event.currentTarget as HTMLElement;
      if (!currentTarget) return;

      if (!player) return;
      const activeState = player.getState();

      const rect = currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const now = Date.now();
      const lastTap = lastTapRef.current;

      const relX = x / rect.width;
      const isLeftSeekZone = relX < centerZoneX.start;
      const isRightSeekZone = relX > centerZoneX.end;
      const isSeekZone = isLeftSeekZone || isRightSeekZone;
      const isCenterX = !isSeekZone;
      const isCenterY =
        y > rect.height * centerZoneY.start &&
        y < rect.height * centerZoneY.end;

      // ─── Double Tap to Seek (Mobile touch only) ───
      if (lastTap && now - lastTap.at < DOUBLE_TAP_WINDOW) {
        event.preventDefault();
        if (pendingPlayTimerRef.current) {
          clearTimeout(pendingPlayTimerRef.current);
          pendingPlayTimerRef.current = null;
        }

        if (activeState.isLive && !activeState.dvr) {
          lastTapRef.current = null;
          return;
        }

        const side: -1 | 1 = x < rect.width / 2 ? -1 : 1;

        if (lastSeekSideRef.current !== side) {
          seekCountRef.current = 0;
        }
        lastSeekSideRef.current = side;
        seekCountRef.current += 1;
        const totalSeconds = seekStep * seekCountRef.current;

        player.seek(activeState.currentTime + side * totalSeconds);
        showSeekFeedback(side === -1 ? "left" : "right", totalSeconds);
        triggerHaptic();
        lastTapRef.current = null;
        return;
      }

      lastTapRef.current = { at: now, x };

      // Reset seek count accumulator when taps are spaced apart
      if (lastTap && now - lastTap.at >= DOUBLE_TAP_WINDOW) {
        seekCountRef.current = 0;
        lastSeekSideRef.current = null;
      }

      if (seekCountTimerRef.current) clearTimeout(seekCountTimerRef.current);
      seekCountTimerRef.current = window.setTimeout(() => {
        seekCountRef.current = 0;
        lastSeekSideRef.current = null;
        seekCountTimerRef.current = null;
      }, SEEK_ACCUMULATOR_TIMEOUT);

      // ─── Center Zone Tap to Toggle Play/Pause ───
      if (isCenterX && isCenterY) {
        if (pendingPlayTimerRef.current) {
          clearTimeout(pendingPlayTimerRef.current);
          pendingPlayTimerRef.current = null;
        }
        pendingPlayTimerRef.current = window.setTimeout(() => {
          pendingPlayTimerRef.current = null;
          const wasPlaying = activeState.isPlaying;
          void player.togglePlay();
          showCenterPlayFeedback(wasPlaying ? "pause" : "play");
        }, DOUBLE_TAP_WINDOW + 10);
      }
    },
    [
      player,
      seekStep,
      showSeekFeedback,
      showCenterPlayFeedback,
      triggerHaptic,
      showControls,
      centerZoneX,
      centerZoneY,
    ],
  );

  return { handleTouchStart };
}
