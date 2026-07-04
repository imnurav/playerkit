import type { QualityLevel } from "../../types/player.types";
import type { PlayerStore } from "../../shared/store";
import Hls, { type Level } from "hls.js";

/**
 * Handles the mapping, syncing, and switching of active video quality levels.
 * Decouples state store management and quality selection callbacks.
 */
export class HlsQualityManager {
  private qualityLevels: QualityLevel[] = [];
  private selectedQuality: number | "auto" = "auto";

  constructor(
    private readonly store: PlayerStore,
    private readonly getHls: () => Hls | null,
    private readonly onQualitiesChange: (levels: QualityLevel[]) => void,
    private readonly onQualityChange: (quality: QualityLevel | "auto") => void,
  ) {}

  /** Get the parsed list of stream quality levels. */
  getQualities(): QualityLevel[] {
    return this.qualityLevels;
  }

  /** Get the requested/selected quality. */
  getSelectedQuality(): number | "auto" {
    return this.selectedQuality;
  }

  /** Get the current actively playing level index. */
  getActiveQuality(): number | null {
    const hls = this.getHls();
    if (!hls) return null;
    const level = hls.currentLevel;
    return level >= 0 ? level : null;
  }

  /**
   * Set the target quality level index or switch to auto quality.
   */
  setQuality(quality: number | "auto"): void {
    const hls = this.getHls();
    if (!hls) return;
    if (quality !== "auto" && !hls.levels[quality]) return;

    hls.nextLevel = quality === "auto" ? -1 : quality;
    this.selectedQuality = quality;

    this.store.setState({
      selectedQuality: quality,
      activeQuality: this.getActiveQuality(),
    });

    const selection = quality === "auto" ? "auto" : this.qualityLevels[quality];
    if (selection) {
      this.onQualityChange(selection);
    }
  }

  /**
   * Syncs quality levels with the state store and fires notifications.
   *
   * @param levels The HLS levels parsed from the stream manifest.
   */
  syncQualities(levels?: Level[]): void {
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
