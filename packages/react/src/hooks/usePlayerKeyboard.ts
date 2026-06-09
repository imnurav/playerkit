import type { UsePlayerKeyboardOptions } from "../types";
import { useEffect, useRef } from "react";

export function usePlayerKeyboard({
  player,
  state,
  seekRelative,
  showControls,
  toggleStretch,
  toggleShortcuts,
  enabled = true,
}: UsePlayerKeyboardOptions) {
  // Use refs to hold the latest state and callback references
  // This avoids unbinding/rebinding the document keydown listener on every single video progress update
  const playerRef = useRef(player);
  const stateRef = useRef(state);
  const seekRelativeRef = useRef(seekRelative);
  const showControlsRef = useRef(showControls);
  const toggleStretchRef = useRef(toggleStretch);
  const toggleShortcutsRef = useRef(toggleShortcuts);

  useEffect(() => {
    playerRef.current = player;
    stateRef.current = state;
    seekRelativeRef.current = seekRelative;
    showControlsRef.current = showControls;
    toggleStretchRef.current = toggleStretch;
    toggleShortcutsRef.current = toggleShortcuts;
  }, [
    player,
    state,
    seekRelative,
    showControls,
    toggleStretch,
    toggleShortcuts,
  ]);

  useEffect(() => {
    if (!enabled) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const activePlayer = playerRef.current;
      const activeState = stateRef.current;
      if (!activePlayer || !activeState) return;

      const target = event.target as HTMLElement;
      const tag = target?.tagName;

      // Block all shortcuts for editable elements, selects, or text inputs (except range sliders)
      if (tag === "TEXTAREA" || tag === "SELECT") return;
      if (tag === "INPUT" && (target as HTMLInputElement).type !== "range")
        return;
      if (target?.isContentEditable) return;

      const adjustPlaybackRate = (direction: -1 | 1) => {
        const rates = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const currentRate = activeState.playbackRate;
        let index = rates.indexOf(currentRate);
        if (index === -1) {
          index = rates.findIndex((r) => r >= currentRate);
          if (index === -1) index = rates.length - 1;
        }
        const nextIndex = Math.min(
          Math.max(index + direction, 0),
          rates.length - 1,
        );
        activePlayer.setPlaybackRate(rates[nextIndex] ?? 1.0);
        showControlsRef.current?.();
      };

      // Shift + > or Shift + <
      if (event.shiftKey) {
        if (event.key === ">" || event.key === ".") {
          event.preventDefault();
          adjustPlaybackRate(1);
          return;
        }
        if (event.key === "<" || event.key === ",") {
          event.preventDefault();
          adjustPlaybackRate(-1);
          return;
        }
      }

      if (event.key === "?") {
        event.preventDefault();
        toggleShortcutsRef.current?.();
        return;
      }

      switch (event.code) {
        case "Space":
          // If focus is on an interactive button, let the browser click activate the button instead of toggling play
          if (tag === "BUTTON") return;

          event.preventDefault();
          void activePlayer.togglePlay();
          showControlsRef.current?.();
          break;
        case "ArrowLeft":
          event.preventDefault();
          seekRelativeRef.current?.(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          seekRelativeRef.current?.(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          activePlayer.setVolume(Math.min(activeState.volume + 0.1, 1));
          showControlsRef.current?.();
          break;
        case "ArrowDown":
          event.preventDefault();
          activePlayer.setVolume(Math.max(activeState.volume - 0.1, 0));
          showControlsRef.current?.();
          break;
        case "KeyF":
          event.preventDefault();
          void activePlayer.toggleFullscreen();
          break;
        case "KeyM":
          event.preventDefault();
          activeState.isMuted ? activePlayer.unmute() : activePlayer.mute();
          break;
        case "KeyS":
          event.preventDefault();
          toggleStretchRef.current?.();
          break;
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [enabled]);
}
