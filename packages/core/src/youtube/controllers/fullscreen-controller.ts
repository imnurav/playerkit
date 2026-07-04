import { FullscreenManager } from "../../shared/fullscreen-manager";
import type { PlayerStore } from "../../shared/store";

/**
 * Handles browser requestFullscreen operations for the YouTube player's container element,
 * locks orientation on mobile device fullscreen entry, and synchronizes state updates to the store.
 */
export class FullscreenController {
  private readonly manager: FullscreenManager;

  constructor(
    fullscreenEl: HTMLElement,
    private readonly store: PlayerStore,
    private readonly onStateChange: () => void,
  ) {
    this.manager = new FullscreenManager(fullscreenEl, (isFullscreen) => {
      this.store.setState({ isFullscreen });
      this.onStateChange();
    });
  }

  /** Request entering fullscreen mode. */
  enterFullscreen(): Promise<void> {
    return this.manager.enter();
  }

  /** Request exiting fullscreen mode. */
  exitFullscreen(): Promise<void> {
    return this.manager.exit();
  }

  /** Toggle active fullscreen status. */
  toggleFullscreen(): Promise<void> {
    return this.manager.toggle();
  }

  /** Clean up resources. */
  destroy(): void {
    this.manager.destroy();
  }
}
