import {
  IconPlay,
  IconPause,
  IconRewind,
  IconVolume,
  IconForward,
  IconMaximize,
  IconMinimize,
  IconSettings,
  IconVolumeLow,
  IconVolumeOff,
  IconVolumeHigh,
} from "./default-icons";
import type { PlayerIconProviderProps } from "../types";
import { createContext, useContext } from "react";
import type { PlayerIconMap } from "./icon-types";

const defaultIconMap: PlayerIconMap = {
  Play: IconPlay,
  Pause: IconPause,
  Rewind: IconRewind,
  Volume: IconVolume,
  Forward: IconForward,
  Maximize: IconMaximize,
  Minimize: IconMinimize,
  Settings: IconSettings,
  VolumeLow: IconVolumeLow,
  VolumeOff: IconVolumeOff,
  VolumeHigh: IconVolumeHigh,
};

const PlayerIconContext = createContext<PlayerIconMap>(defaultIconMap);

export function PlayerIconProvider(props: PlayerIconProviderProps) {
  const { icons, children } = props;
  return (
    <PlayerIconContext.Provider value={{ ...defaultIconMap, ...icons }}>
      {children}
    </PlayerIconContext.Provider>
  );
}

export function usePlayerIcons(): PlayerIconMap {
  return useContext(PlayerIconContext);
}
