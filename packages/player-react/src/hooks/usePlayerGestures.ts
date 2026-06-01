import type { Player, PlayerSnapshot } from "@nurav/player-core";
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

      // Prevent browser defaults (text selection, double-tap zoom, 300ms delay).
      // Video elements get this for free from the browser — plain divs (like our
      // YouTube player root) do not, which is why we must do it explicitly.
      // Without this, the browser can swallow the second tap as a text-selection
      // gesture, breaking double-tap seek entirely.
      event.preventDefault();

      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      // Current tap position relative to the player
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const now = Date.now();
      const lastTap = lastTapRef.current;

      // ─── Tap Zone Classification ───────────────────────────────────────────
      // Left seek zone  : 0  → 40% of width
      // Center zone     : 40% → 60% of width  (play/pause)
      // Right seek zone : 60% → 100% of width
      const relX = x / rect.width;
      const isLeftSeekZone  = relX < centerZoneX.start;
      const isRightSeekZone = relX > centerZoneX.end;
      const isSeekZone      = isLeftSeekZone || isRightSeekZone;
      const isCenterX       = !isSeekZone; // middle band
      const isCenterY =
        y > rect.height * centerZoneY.start &&
        y < rect.height * centerZoneY.end;

      // ─── Double Tap to Seek ────────────────────────────────────────────────
      // Fires when the gap between two taps is within DOUBLE_TAP_WINDOW ms.
      // Direction is determined by the CURRENT tap position (not the stale
      // first-tap position) so left/right always maps to backward/forward.
      if (lastTap && now - lastTap.at < DOUBLE_TAP_WINDOW) {
        event.preventDefault();
        if (pendingPlayTimerRef.current) {
          clearTimeout(pendingPlayTimerRef.current);
          pendingPlayTimerRef.current = null;
        }

        // Use current tap x for direction — the side should reflect where
        // the user is intentionally tapping, not where they were last time.
        // If the user double-taps in the center zone we treat it as
        // backward/forward based on which center half they landed on.
        const side: -1 | 1 = x < rect.width / 2 ? -1 : 1;

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

      // Reset accumulator when taps are too far apart in time
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

      // ─── Center Zone Single Tap → Play/Pause ──────────────────────────────
      // Only fire play/pause when the tap is in the center zone both
      // horizontally and vertically — seek zones are handled by double-tap.
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
