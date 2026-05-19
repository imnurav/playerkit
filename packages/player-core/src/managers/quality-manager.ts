import type { HlsInstance } from "../core/hls";
import type { QualityLevel } from "../types/player.types";
import { getQualityLabel } from "../utils/helpers";

export class QualityManager {
  private hls: HlsInstance | null = null;

  setHls(hls: HlsInstance | null) {
    this.hls = hls;
  }

  getQualities(): QualityLevel[] {
    if (!this.hls) {
      return [];
    }

    return this.hls.levels.map((level, index) => ({
      id: index,
      label: getQualityLabel(level.height, level.bitrate),
      width: level.width,
      height: level.height,
      bitrate: level.bitrate,
    }));
  }

  getSelectedQuality(): number | "auto" {
    if (!this.hls || this.hls.manualLevel === -1) {
      return "auto";
    }

    return this.hls.manualLevel;
  }

  getActiveQuality(): number | null {
    if (!this.hls || this.hls.currentLevel === -1) {
      return null;
    }

    return this.hls.currentLevel;
  }

  setQuality(quality: number | "auto") {
    if (!this.hls) {
      return;
    }

    this.hls.currentLevel = quality === "auto" ? -1 : quality;
  }
}
