import type { ErrorData } from "hls.js";

import type { PlayerState, QualityLevel } from "./player.types";

export type PlayerError = {
  message: string;
  fatal?: boolean;
  details?: string;
  raw?: Error | ErrorData | MediaError;
};

export type PlayerEventMap = {
  ready: PlayerState;
  play: PlayerState;
  pause: PlayerState;
  ended: PlayerState;
  timeupdate: PlayerState;
  durationchange: PlayerState;
  volumechange: PlayerState;
  seeking: PlayerState;
  seeked: PlayerState;
  waiting: PlayerState;
  playing: PlayerState;
  statechange: PlayerState;
  sourcechange: string;
  qualitieschange: QualityLevel[];
  qualitychange: QualityLevel | "auto";
  fullscreenchange: boolean;
  error: PlayerError;
  destroy: void;
};

export type PlayerEventName = keyof PlayerEventMap;
