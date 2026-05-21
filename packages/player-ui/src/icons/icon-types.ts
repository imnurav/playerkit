import type { ReactNode } from "react";

export type IconComponent = (props: { className?: string }) => ReactNode;

export type PlayerIconMap = {
  Play: IconComponent;
  Pause: IconComponent;
  Rewind: IconComponent;
  Forward: IconComponent;
  Volume: IconComponent;
  VolumeOff: IconComponent;
  Maximize: IconComponent;
  Minimize: IconComponent;
  Settings: IconComponent;
};
