import Hls from "hls.js";

import { FullscreenManager } from "../managers/fullscreen-manager";
import { KeyboardManager } from "../managers/keyboard-manager";
import { QualityManager } from "../managers/quality-manager";
import type { PlayerEventMap } from "../types/events.types";
import type {
  CreatePlayerOptions,
  PlayerSnapshot,
  PlayerStateListener,
  SourceOptions,
  Unsubscribe,
} from "../types/player.types";
import {
  clamp,
  getBufferedEnd,
  getBufferedPercent,
  getBufferedRanges,
  getMediaDuration,
} from "../utils/helpers";
import { EventEmitter } from "./events";
import {
  attachHlsSource,
  canUseNativeHls,
  createHls,
  type HlsInstance,
} from "./hls";
import { createInitialPlayerState, PlayerStore } from "./store";

export class Player extends EventEmitter<PlayerEventMap> {
  private video: HTMLVideoElement;
  private src: string;
  private root: HTMLElement;
  private hls: HlsInstance | null = null;
  private store: PlayerStore;
  private qualityManager = new QualityManager();
  private fullscreenManager: FullscreenManager;
  private keyboardManager: KeyboardManager | null = null;
  private cleanupCallbacks: Array<() => void> = [];

  constructor(options: CreatePlayerOptions) {
    super();

    this.video = options.video;
    this.src = options.src;
    this.root = options.root || options.video;
    this.store = new PlayerStore(createInitialPlayerState(options.src));
    this.fullscreenManager = new FullscreenManager(
      this.root,
      this.handleFullscreenChange,
    );

    this.syncMediaState();
    this.attachEvents();
    this.loadSource({
      src: options.src,
      autoPlay: options.autoPlay,
      startTime: options.startTime,
    });

    if (options.keyboard) {
      this.keyboardManager = new KeyboardManager({
        target: this.root,
        controls: this,
        getCurrentTime: () => this.video.currentTime,
        getMuted: () => this.video.muted,
        getVolume: () => this.video.volume,
      });
    }
  }

  private attachEvents() {
    this.listen(this.video, "loadedmetadata", () => {
      this.patchState({
        isReady: true,
        duration: getMediaDuration(this.video),
      });
      this.emit("ready", this.getState());
    });

    this.listen(this.video, "play", () => {
      this.patchState({ isPlaying: true });
      this.emit("play", this.getState());
    });

    this.listen(this.video, "pause", () => {
      this.patchState({ isPlaying: false });
      this.emit("pause", this.getState());
    });

    this.listen(this.video, "ended", () => {
      this.patchState({ isPlaying: false, isBuffering: false });
      this.emit("ended", this.getState());
    });

    this.listen(this.video, "timeupdate", () => {
      this.patchState({
        currentTime: this.video.currentTime,
        ...this.getBufferedState(),
      });
      this.emit("timeupdate", this.getState());
    });

    this.listen(this.video, "durationchange", () => {
      this.patchState({
        duration: getMediaDuration(this.video),
        ...this.getBufferedState(),
      });
      this.emit("durationchange", this.getState());
    });

    this.listen(this.video, "progress", () => {
      this.patchState(this.getBufferedState());
    });

    this.listen(this.video, "volumechange", () => {
      this.patchState({ volume: this.video.volume, isMuted: this.video.muted });
      this.emit("volumechange", this.getState());
    });

    this.listen(this.video, "seeking", () => {
      this.patchState({ currentTime: this.video.currentTime });
      this.emit("seeking", this.getState());
    });

    this.listen(this.video, "seeked", () => {
      this.patchState({ currentTime: this.video.currentTime });
      this.emit("seeked", this.getState());
    });

    this.listen(this.video, "waiting", () => {
      this.patchState({ isBuffering: true });
      this.emit("waiting", this.getState());
    });

    this.listen(this.video, "playing", () => {
      this.patchState({ isBuffering: false, isPlaying: true });
      this.emit("playing", this.getState());
    });

    this.listen(this.video, "error", () => {
      this.emit("error", {
        message: this.video.error?.message || "Video playback failed.",
        raw: this.video.error || undefined,
      });
    });
  }

  async play() {
    await this.video.play();
  }

  pause() {
    this.video.pause();
  }

  async togglePlay() {
    if (this.video.paused) {
      await this.play();
      return;
    }

    this.pause();
  }

  seek(time: number) {
    this.video.currentTime = clamp(time, 0, getMediaDuration(this.video));
    this.patchState({ currentTime: this.video.currentTime });
  }

  setVolume(volume: number) {
    this.video.volume = clamp(volume, 0, 1);
    this.video.muted = this.video.volume === 0;
  }

  mute() {
    this.video.muted = true;
  }

  unmute() {
    this.video.muted = false;
  }

  setPlaybackRate(rate: number) {
    this.video.playbackRate = clamp(rate, 0.25, 4);
    this.patchState({ playbackRate: this.video.playbackRate });
  }

  setQuality(quality: number | "auto") {
    const qualities = this.qualityManager.getQualities();

    if (quality !== "auto" && !qualities[quality]) {
      return;
    }

    this.qualityManager.setQuality(quality);
    this.patchState({
      selectedQuality: this.qualityManager.getSelectedQuality(),
      activeQuality: this.qualityManager.getActiveQuality(),
    });
    this.emit(
      "qualitychange",
      quality === "auto" ? "auto" : qualities[quality],
    );
  }

  getQualities() {
    return this.qualityManager.getQualities();
  }

  setSource(options: SourceOptions) {
    this.loadSource(options);
  }

  async enterFullscreen() {
    await this.fullscreenManager.enter();
  }

  async exitFullscreen() {
    await this.fullscreenManager.exit();
  }

  async toggleFullscreen() {
    await this.fullscreenManager.toggle();
  }

  toggleStretch() {
    const current = this.store.getState().isStretched;
    this.patchState({ isStretched: !current });
    this.video.style.objectFit = current ? "contain" : "fill";
  }

  getState(): PlayerSnapshot {
    return this.store.getState();
  }

  subscribe(listener: PlayerStateListener): Unsubscribe {
    return this.store.subscribe(listener);
  }

  destroy() {
    this.cleanupCallbacks.forEach((callback) => {
      callback();
    });
    this.cleanupCallbacks = [];

    this.keyboardManager?.destroy();
    this.fullscreenManager.destroy();
    this.destroyHls();
    this.video.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.store.destroy();
    this.emit("destroy");
    this.removeAllListeners();
  }

  private loadSource(options: SourceOptions) {
    this.destroyHls();

    this.src = options.src;
    this.patchState({
      ...createInitialPlayerState(options.src),
      volume: this.video.volume,
      isMuted: this.video.muted,
      playbackRate: this.video.playbackRate,
      isFullscreen: this.fullscreenManager.isFullscreen(),
    });

    this.hls = createHls();

    if (this.hls) {
      this.qualityManager.setHls(this.hls);
      this.attachHlsEvents();
      attachHlsSource(this.hls, this.video, options.src);
    } else if (canUseNativeHls(this.video)) {
      this.video.src = options.src;
    } else {
      this.emit("error", {
        message: "This browser cannot play HLS streams.",
      });
    }

    if (options.startTime !== undefined) {
      this.video.currentTime = options.startTime;
    }

    if (options.autoPlay) {
      void this.play();
    }

    this.emit("sourcechange", options.src);
  }

  private attachHlsEvents() {
    if (!this.hls) {
      return;
    }

    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.syncQualities();
    });

    this.hls.on(Hls.Events.LEVELS_UPDATED, () => {
      this.syncQualities();
    });

    this.hls.on(Hls.Events.LEVEL_SWITCHED, () => {
      this.patchState({
        activeQuality: this.qualityManager.getActiveQuality(),
      });
    });

    this.hls.on(Hls.Events.ERROR, (_, data) => {
      this.emit("error", {
        message: data.reason || data.details || "HLS playback failed.",
        fatal: data.fatal,
        details: data.details,
        raw: data,
      });
    });
  }

  private syncQualities() {
    const qualities = this.qualityManager.getQualities();

    this.patchState({
      qualities,
      selectedQuality: this.qualityManager.getSelectedQuality(),
      activeQuality: this.qualityManager.getActiveQuality(),
    });
    this.emit("qualitieschange", qualities);
  }

  private destroyHls() {
    this.hls?.destroy();
    this.hls = null;
    this.qualityManager.setHls(null);
  }

  private syncMediaState() {
    this.patchState({
      currentTime: this.video.currentTime,
      duration: getMediaDuration(this.video),
      volume: this.video.volume,
      isMuted: this.video.muted,
      isPlaying: !this.video.paused,
      playbackRate: this.video.playbackRate,
      isFullscreen: this.fullscreenManager.isFullscreen(),
      ...this.getBufferedState(),
    });
  }

  private getBufferedState() {
    return {
      buffered: getBufferedRanges(this.video),
      bufferedEnd: getBufferedEnd(this.video),
      bufferedPercent: getBufferedPercent(this.video),
    };
  }

  private patchState(update: Partial<PlayerSnapshot>) {
    this.store.setState(update);
    this.emit("statechange", this.getState());
  }

  private handleFullscreenChange = (isFullscreen: boolean) => {
    this.patchState({ isFullscreen });
    this.emit("fullscreenchange", isFullscreen);
  };

  private listen<TEvent extends keyof HTMLVideoElementEventMap>(
    target: HTMLVideoElement,
    event: TEvent,
    listener: (event: HTMLVideoElementEventMap[TEvent]) => void,
  ) {
    target.addEventListener(event, listener);
    this.cleanupCallbacks.push(() => {
      target.removeEventListener(event, listener);
    });
  }
}
