import { createContext, useContext, type ReactNode } from "react";
import type { PlayerIconMap } from "./icon-types";
import {
  IconPlay,
  IconPause,
  IconRewind,
  IconVolume,
  IconForward,
  IconMaximize,
  IconMinimize,
  IconSettings,
  IconVolumeOff,
} from "./default-icons";

const defaultIconMap: PlayerIconMap = {
  Play: IconPlay,
  Pause: IconPause,
  Rewind: IconRewind,
  Volume: IconVolume,
  Forward: IconForward,
  Maximize: IconMaximize,
  Minimize: IconMinimize,
  Settings: IconSettings,
  VolumeOff: IconVolumeOff,
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
