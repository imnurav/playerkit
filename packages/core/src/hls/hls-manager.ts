import { createHls, attachHlsSource, type HlsInstance } from "./hls";
import type { QualityLevel } from "../types/player.types";
import type { ErrorManager } from "../shared/error-manager";
import type { PlayerStore } from "../shared/store";
import Hls, { type HlsConfig } from "hls.js";

/** Shape of the LEVEL_UPDATED event data for live detection. */
export type LevelUpdatePayload = {
  isLive: boolean;
  liveEdge: number;
};

type HlsLevel = {
  width?: number;
  height?: number;
  bitrate: number;
};

/** Shape of a new quality level selection. */
export type QualityChangePayload = QualityLevel | "auto";

export class HlsManager {
  private store: PlayerStore;
  private lowLatency: boolean;
  private video: HTMLVideoElement;
  private recoverAttempted = false;
  private hls: HlsInstance | null = null;
  private qualityLevels: QualityLevel[] = [];
  private selectedQuality: number | "auto" = "auto";
  private xhrSetup: ((xhr: XMLHttpRequest, url: string) => void) | null = null;

  /** Called when a new level is detected from manifest (for quality UI sync). */
  private onQualitiesChange: (levels: QualityLevel[]) => void;
  /** Called when the user switches quality. */
  private onQualityChange: (quality: QualityLevel | "auto") => void;
  /** Called on every LEVEL_UPDATED — lets Player wire this to LiveManager. */
  private onLevelUpdated: (payload: LevelUpdatePayload) => void;
  /** Centralized error manager — handles classification and state writing. */
  private errorManager: ErrorManager;

  constructor(
    video: HTMLVideoElement,
    store: PlayerStore,
    callbacks: {
      onQualitiesChange: (levels: QualityLevel[]) => void;
      onQualityChange: (quality: QualityLevel | "auto") => void;
      onLevelUpdated: (payload: LevelUpdatePayload) => void;
    },
    errorManager: ErrorManager,
    lowLatency: boolean,
    xhrSetup: ((xhr: XMLHttpRequest, url: string) => void) | null,
  ) {
    this.video = video;
    this.store = store;
    this.lowLatency = lowLatency;
    this.xhrSetup = xhrSetup;
    this.errorManager = errorManager;
    this.onQualitiesChange = callbacks.onQualitiesChange;
    this.onQualityChange = callbacks.onQualityChange;
    this.onLevelUpdated = callbacks.onLevelUpdated;
  }

  destroy() {
    this.hls?.destroy();
    this.hls = null;
  }

  getInstance() {
    return this.hls;
  }

  // ─── Source loading ─────────────────────────────────────────────────────

  /** Load a stream URL via hls.js. Returns true if hls.js was used, false for native fallback. */
  loadStream(streamUrl: string): boolean {
    this.destroy();
    this.recoverAttempted = false;

    const config: Partial<HlsConfig> = { liveSyncDurationCount: 3 };
    if (this.lowLatency) {
      Object.assign(config, {
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
    }
    if (this.xhrSetup) config.xhrSetup = this.xhrSetup;

    this.hls = createHls(config, !!this.xhrSetup);

    if (!this.hls) {
      this.video.src = streamUrl;
      return false;
    }

    this.attachEvents();
    attachHlsSource(this.hls, this.video, streamUrl);
    return true;
  }

  // ─── Events ─────────────────────────────────────────────────────────────

  private attachEvents() {
    if (!this.hls) return;

    this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const levels = data.levels.length > 0 ? data.levels : undefined;
      this.syncQualities(levels as HlsLevel[]);
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, () => {
      this.syncQualities();
      this.store.setState({ activeQuality: this.getActiveQuality() });
    });

    this.hls.on(Hls.Events.LEVELS_UPDATED, () => {
      this.syncQualities(this.hls?.levels as HlsLevel[]);
    });

    this.hls.on(Hls.Events.LEVEL_UPDATED, (_, data) => {
      this.onLevelUpdated({
        isLive: data.details.live,
        liveEdge: data.details.edge ?? 0,
      });
    });

    this.hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;

      // Attempt automatic recovery before surfacing the error to the user.
      if (!this.recoverAttempted && this.hls) {
        switch (data.type) {
          case Hls.ErrorTypes.MEDIA_ERROR:
            this.recoverAttempted = true;
            this.hls.recoverMediaError();
            return;
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Manifest errors cannot be recovered by startLoad — fall through.
            if (
              data.details === "manifestLoadError" ||
              data.details === "manifestLoadTimeOut" ||
              data.details === "manifestParsingError"
            )
              break;
            this.recoverAttempted = true;
            this.hls.startLoad(-1);
            return;
        }
      }

      // Recovery failed or not applicable — delegate to ErrorManager.
      this.errorManager.raise(this.errorManager.classifyHlsError(data));
    });
  }

  // ─── Quality ─────────────────────────────────────────────────────────────

  getQualities(): QualityLevel[] {
    return this.qualityLevels;
  }

  getSelectedQuality(): number | "auto" {
    return this.selectedQuality;
  }

  getActiveQuality(): number | null {
    if (!this.hls) return null;
    const level = this.hls.currentLevel;
    return level >= 0 ? level : null;
  }

  setQuality(quality: number | "auto") {
    if (!this.hls) return;
    if (quality !== "auto" && !this.hls.levels[quality]) return;
    this.hls.nextLevel = quality === "auto" ? -1 : quality;
    this.selectedQuality = quality;
    this.store.setState({
      selectedQuality: quality,
      activeQuality: this.getActiveQuality(),
    });
    this.onQualityChange(
      quality === "auto" ? "auto" : this.qualityLevels[quality],
    );
  }

  private syncQualities(
    levels?: Array<{ width?: number; height?: number; bitrate: number }>,
  ) {
    if (levels) {
      this.qualityLevels = levels.map((l, i) => ({
        id: i,
        label: l.height
          ? `${l.height}p`
          : `${Math.round(l.bitrate / 1000)} kbps`,
        width: l.width || 0,
        height: l.height || 0,
        bitrate: l.bitrate,
      }));
    }

    this.store.setState({
      qualities: this.qualityLevels,
      selectedQuality: this.selectedQuality,
      activeQuality: this.getActiveQuality(),
    });
    this.onQualitiesChange(this.qualityLevels);
  }
}
