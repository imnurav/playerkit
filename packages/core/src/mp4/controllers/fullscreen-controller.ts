import { FullscreenManager } from "../../shared/fullscreen-manager";

/**
 * Controls fullscreen transition requests and state synchronization.
 * Wraps the shared FullscreenManager for the MP4 player package.
 */
export class FullscreenController {
  private readonly manager: FullscreenManager;

  constructor(
    root: HTMLElement,
    onFullscreenChange: (isFullscreen: boolean) => void,
  ) {
    this.manager = new FullscreenManager(root, onFullscreenChange);
  }

  /** Request entering fullscreen mode. */
  enter(): Promise<void> {
    return this.manager.enter();
  }

  /** Request exiting fullscreen mode. */
  exit(): Promise<void> {
    return this.manager.exit();
  }

  /** Toggle fullscreen state. */
  toggle(): Promise<void> {
    return this.manager.toggle();
  }

  /** Checks if the player is currently in fullscreen mode. */
  isFullscreen(): boolean {
    return this.manager.isFullscreen();
  }

  /** Cleanup resources. */
  destroy(): void {
    this.manager.destroy();
  }
}
