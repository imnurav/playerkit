import { SecurityManager } from "../../shared/security-manager";
import type { PlaybackController } from "./playback-controller";
import type { PlayerStore } from "../../shared/store";

/**
 * Manages player element security overlays, DevTools console probing, and disable configuration logic.
 */
export class SecurityController {
  private manager: SecurityManager | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly video: HTMLVideoElement,
    private readonly store: PlayerStore,
  ) {}

  /**
   * Applies the security policy, disabling hotkeys, context menus, and detecting debuggers.
   */
  setSecurityConfig(
    disableDevOptions: boolean | undefined,
    playbackController: PlaybackController,
  ): void {
    this.destroy();

    // Reset detection flag on policy updates
    this.store.setState({ isDevtoolsDetected: false });

    this.manager = new SecurityManager({
      root: this.root,
      video: this.video,
      store: this.store,
      controls: {
        play: () => playbackController.play(),
        pause: () => playbackController.pause(),
      },
      disableDevOptions,
    });
  }

  /** Tear down overlays and detach listeners. */
  destroy(): void {
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}
