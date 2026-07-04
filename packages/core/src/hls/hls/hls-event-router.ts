import type { HlsRecoveryManager } from "./hls-recovery-manager";
import type { HlsQualityManager } from "./hls-quality-manager";
import type { PlayerStore } from "../../shared/store";
import Hls, { type Level } from "hls.js";

export type LevelUpdatePayload = {
  isLive: boolean;
  liveEdge: number;
};

/**
 * Handles subscribing to HLS.js instance events and routing them to specialized controllers.
 */
export class HlsEventRouter {
  constructor(
    private readonly store: PlayerStore,
    private readonly qualityManager: HlsQualityManager,
    private readonly recoveryManager: HlsRecoveryManager,
    private readonly onLevelUpdated: (payload: LevelUpdatePayload) => void,
  ) {}

  /**
   * Binds to HLS.js events and maps them to store state changes and recovery workflows.
   *
   * @param hls The active Hls.js instance.
   */
  routeEvents(hls: Hls): void {
    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const levels = data.levels.length > 0 ? data.levels : undefined;
      this.qualityManager.syncQualities(levels as Level[]);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, () => {
      this.qualityManager.syncQualities();
      this.store.setState({
        activeQuality: this.qualityManager.getActiveQuality(),
      });
    });

    hls.on(Hls.Events.LEVELS_UPDATED, () => {
      this.qualityManager.syncQualities(hls.levels as Level[]);
    });

    hls.on(Hls.Events.LEVEL_UPDATED, (_, data) => {
      this.onLevelUpdated({
        isLive: data.details.live,
        liveEdge: data.details.edge ?? 0,
      });
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;
      this.recoveryManager.handleFatalError(hls, data);
    });
  }
}
