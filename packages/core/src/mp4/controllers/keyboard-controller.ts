import type { FullscreenController } from "./fullscreen-controller";
import { KeyboardManager } from "../../shared/keyboard-manager";
import type { PlaybackController } from "./playback-controller";

/**
 * Manages binding keydown shortcut events to player control commands.
 */
export class KeyboardController {
  private manager: KeyboardManager | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly video: HTMLVideoElement,
  ) {}

  /** Initialize keyboard shortcut listeners on the target player root. */
  initialize(
    playbackController: PlaybackController,
    fullscreenController: FullscreenController,
    toggleStretch: () => void,
  ): void {
    this.manager = new KeyboardManager({
      target: this.root,
      controls: {
        togglePlay: () => playbackController.togglePlay(),
        seek: (time) => playbackController.seek(time),
        mute: () => playbackController.mute(),
        unmute: () => playbackController.unmute(),
        toggleFullscreen: () => fullscreenController.toggle(),
        toggleStretch,
        setVolume: (vol) => playbackController.setVolume(vol),
        setPlaybackRate: (rate) => playbackController.setPlaybackRate(rate),
      },
      getCurrentTime: () => this.video.currentTime,
      getMuted: () => this.video.muted,
      getVolume: () => this.video.volume,
      getPlaybackRate: () => this.video.playbackRate,
    });
  }

  /** Unregister shortcut listeners. */
  destroy(): void {
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}
