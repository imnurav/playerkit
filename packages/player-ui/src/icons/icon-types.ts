import type { ReactNode } from "react";

export type IconComponent = (props: { className?: string }) => ReactNode;

export type PlayerIconMap = {
  Play: IconComponent;
  Pause: IconComponent;
  Rewind: IconComponent;
  Volume: IconComponent;
  Forward: IconComponent;
  Maximize: IconComponent;
  Minimize: IconComponent;
  Settings: IconComponent;
  VolumeLow: IconComponent;
  VolumeOff: IconComponent;
  VolumeHigh: IconComponent;
};
