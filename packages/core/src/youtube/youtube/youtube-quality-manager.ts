import type { YouTubeIFramePlayer } from "../../types/youtube.types";
import type { QualityLevel } from "../../types/player.types";
import type { PlayerStore } from "../../shared/store";

/**
 * Handles the mapping, syncing, and switching of YouTube video quality levels.
 * Decouples quality selection and store synchronization.
 */
export class YoutubeQualityManager {
  private availableQualities: string[] = [];
  private selectedQuality: number | "auto" = "auto";

  constructor(
    private readonly store: PlayerStore,
    private readonly getPlayer: () => YouTubeIFramePlayer | null,
    private readonly onQualitiesChange: (levels: QualityLevel[]) => void,
  ) {}

  /** Get the active list of quality label strings. */
  getAvailableQualities(): string[] {
    return this.availableQualities;
  }

  /** Set the active playback quality level or switch to default (auto). */
  setQuality(quality: number | "auto"): void {
    const player = this.getPlayer();
    if (!player) return;

    if (quality === "auto") {
      player.setPlaybackQuality("default");
      this.selectedQuality = "auto";
      this.store.setState({ selectedQuality: "auto" });
      return;
    }

    const label = this.availableQualities[quality];
    if (label) {
      player.setPlaybackQuality(label);
      this.selectedQuality = quality;
      this.store.setState({
        selectedQuality: quality,
        activeQuality: quality,
      });
    }
  }

  /** Sync available quality levels with the state store. */
  syncQualities(): void {
    const player = this.getPlayer();
    if (!player) return;

    try {
      this.availableQualities = player.getAvailableQualityLevels?.() ?? [];
      const active = player.getPlaybackQuality?.() ?? "auto";

      const qualities: QualityLevel[] = this.availableQualities.map((q, i) => ({
        id: i,
        label: q,
        width: 0,
        height: 0,
        bitrate: 0,
      }));

      this.store.setState({
        qualities,
        selectedQuality: this.selectedQuality,
        activeQuality:
          active === "auto" ? null : this.availableQualities.indexOf(active),
      });

      this.onQualitiesChange(qualities);
    } catch {
      // Player might not be ready yet
    }
  }
}
