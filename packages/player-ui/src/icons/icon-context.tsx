import { createContext, useContext, type ReactNode } from "react";
import type { PlayerIconMap } from "./icon-types";
import {
  IconPlay,
  IconPause,
  IconRewind,
  IconForward,
  IconVolume,
  IconVolumeOff,
  IconMaximize,
  IconMinimize,
  IconSettings,
} from "./default-icons";

const defaultIconMap: PlayerIconMap = {
  Play: IconPlay,
  Pause: IconPause,
  Rewind: IconRewind,
  Forward: IconForward,
  Volume: IconVolume,
  VolumeOff: IconVolumeOff,
  Maximize: IconMaximize,
  Minimize: IconMinimize,
  Settings: IconSettings,
};

const PlayerIconContext = createContext<PlayerIconMap>(defaultIconMap);

export function PlayerIconProvider({
  icons,
  children,
}: {
  icons?: Partial<PlayerIconMap>;
  children: ReactNode;
}) {
  return (
    <PlayerIconContext.Provider value={{ ...defaultIconMap, ...icons }}>
      {children}
    </PlayerIconContext.Provider>
  );
}

export function usePlayerIcons(): PlayerIconMap {
  return useContext(PlayerIconContext);
}
