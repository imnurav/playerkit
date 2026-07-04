import { HlsRecoveryManager } from "../hls/hls-recovery-manager";
import type { ErrorManager } from "../../shared/error-manager";
import { HlsQualityManager } from "../hls/hls-quality-manager";
import type { QualityLevel } from "../../types/player.types";
import { HlsConfigBuilder } from "../hls/hls-config-builder";
import { createHls, attachHlsSource } from "../hls-engine";
import type { PlayerStore } from "../../shared/store";
import {
  type LevelUpdatePayload,
  HlsEventRouter,
} from "../hls/hls-event-router";
import Hls from "hls.js";

/**
 * Coordinates initialization, event routing, quality selection, and recovery of the Hls.js library instance.
 * Exposes a clean, high-level API to load and sync HLS video sources.
 */
export class HlsController {
  private hls: Hls | null = null;
  private readonly qualityManager: HlsQualityManager;
  private readonly recoveryManager: HlsRecoveryManager;
  private readonly eventRouter: HlsEventRouter;

  constructor(
    private readonly video: HTMLVideoElement,
    store: PlayerStore,
    callbacks: {
      onQualitiesChange: (levels: QualityLevel[]) => void;
      onQualityChange: (quality: QualityLevel | "auto") => void;
      onLevelUpdated: (payload: LevelUpdatePayload) => void;
    },
    errorManager: ErrorManager,
    private readonly lowLatency: boolean,
    private xhrSetup: ((xhr: XMLHttpRequest, url: string) => void) | null,
  ) {
    this.qualityManager = new HlsQualityManager(
      store,
      () => this.hls,
      callbacks.onQualitiesChange,
      callbacks.onQualityChange,
    );
    this.recoveryManager = new HlsRecoveryManager(errorManager);
    this.eventRouter = new HlsEventRouter(
      store,
      this.qualityManager,
      this.recoveryManager,
      callbacks.onLevelUpdated,
    );
  }

  /** Retrieve the current active HLS.js instance. */
  getInstance(): Hls | null {
    return this.hls;
  }

  /** Update the XMLHttpRequest setup configuration hook (e.g. for header injection). */
  updateXhrSetup(
    xhrSetup: ((xhr: XMLHttpRequest, url: string) => void) | null,
  ): void {
    this.xhrSetup = xhrSetup;
  }

  /**
   * Instantiates HLS.js, binds events, and attaches it to the video tag.
   * Falls back to native video elements if HLS.js is unsupported.
   *
   * @param streamUrl Stream manifest URL.
   * @returns true if Hls.js engine was loaded, false if native fallback was used.
   */
  loadStream(streamUrl: string): boolean {
    this.destroy();
    this.recoveryManager.reset();

    const config = HlsConfigBuilder.build(
      streamUrl,
      this.lowLatency,
      this.xhrSetup,
    );
    this.hls = createHls(config, !!this.xhrSetup);

    if (!this.hls) {
      this.video.src = streamUrl;
      return false;
    }

    this.eventRouter.routeEvents(this.hls);
    attachHlsSource(this.hls, this.video, streamUrl);
    return true;
  }

  /** Get parsed quality levels. */
  getQualities(): QualityLevel[] {
    return this.qualityManager.getQualities();
  }

  /** Get currently selected quality (auto or index). */
  getSelectedQuality(): number | "auto" {
    return this.qualityManager.getSelectedQuality();
  }

  /** Get active quality level index. */
  getActiveQuality(): number | null {
    return this.qualityManager.getActiveQuality();
  }

  /** Set target quality selection. */
  setQuality(quality: number | "auto"): void {
    this.qualityManager.setQuality(quality);
  }

  /** Clean up HLS.js instances and event listeners. */
  destroy(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }
}
