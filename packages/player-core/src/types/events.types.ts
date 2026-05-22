import type { PlayerState, QualityLevel } from "./player.types";
import type { ErrorData } from "hls.js";

export type PlayerErrorCategory =
  | "network"
  | "source"
  | "auth"
  | "media"
  | "server"
  | "unknown";

export type PlayerError = {
  message: string;
  fatal?: boolean;
  category?: PlayerErrorCategory;
  details?: string;
  raw?: Error | ErrorData | MediaError;
};

export type PlayerEventMap = {
  play: PlayerState;
  ready: PlayerState;
  pause: PlayerState;
  ended: PlayerState;
  seeked: PlayerState;
  seeking: PlayerState;
  waiting: PlayerState;
  playing: PlayerState;
  sourcechange: string;
  timeupdate: PlayerState;
  statechange: PlayerState;
  volumechange: PlayerState;
  fullscreenchange: boolean;
  durationchange: PlayerState;
  qualitieschange: QualityLevel[];
  qualitychange: QualityLevel | "auto";

  /** Emitted when live state changes (live detected, edge state change) */
  livestatechange: {
    dvr: boolean;
    isLive: boolean;
    liveLatency: number;
    isAtLiveEdge: boolean;
  };

  destroy: void;
  error: PlayerError;
};

export type PlayerEventName = keyof PlayerEventMap;
