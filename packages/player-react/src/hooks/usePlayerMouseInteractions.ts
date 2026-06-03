import type { UsePlayerMouseInteractionsOptions } from "../types";
import { useCallback, useRef } from "react";

/**
 * Hook to manage desktop / mouse interactions specifically:
 * - Single click on the player container area toggles play/pause.
 * - Double click on the player container area toggles full screen.
 */
export function usePlayerMouseInteractions({
  player,
  isReady,
  showControls,
}: UsePlayerMouseInteractionsOptions) {
  const clickTimeoutRef = useRef<number | null>(null);

  const handleMouseClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Skip click events on UI overlay controls and dropdown targets
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

      if (!player || !isReady) return;

      if (clickTimeoutRef.current) {
        // Double-click detected! Cancel pending single-click action
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;

        // Double-click -> Toggle Fullscreen
        void player.toggleFullscreen();
      } else {
        // Single-click timer
        clickTimeoutRef.current = window.setTimeout(() => {
          clickTimeoutRef.current = null;
          // Single-click only reveals controls, does not toggle playback
        }, 250);
      }
    },
    [player, isReady, showControls],
  );

  return { handleMouseClick };
}
