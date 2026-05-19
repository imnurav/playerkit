import { useEffect, useState } from "react";
import type {
  PlayerControlsPreset,
  PlayerControlsLayoutPreset,
} from "@varun/player-themes";

const mobileControlsQuery = "(max-width: 760px)";

export function usePlayerControlPreset(
  controls: PlayerControlsPreset,
): PlayerControlsLayoutPreset {
  const [isMobileControls, setIsMobileControls] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileControlsQuery);
    const syncControlsPreset = () => setIsMobileControls(mediaQuery.matches);

    syncControlsPreset();
    mediaQuery.addEventListener("change", syncControlsPreset);

    return () => {
      mediaQuery.removeEventListener("change", syncControlsPreset);
    };
  }, []);

  return isMobileControls ? controls.mobile : controls.desktop;
}
