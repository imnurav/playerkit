export class FullscreenManager {
  private element: HTMLElement;
  private onChange: (isFullscreen: boolean) => void;

  constructor(element: HTMLElement, onChange: (isFullscreen: boolean) => void) {
    this.element = element;
    this.onChange = onChange;

    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
  }

  isFullscreen() {
    return document.fullscreenElement === this.element;
  }

  async enter() {
    if (!document.fullscreenElement) {
      await this.element.requestFullscreen();

      // Lock screen orientation to landscape on mobile for video playback
      this.lockOrientation();
    }
  }

  async exit() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();

      // Unlock screen orientation when exiting fullscreen
      this.unlockOrientation();
    }
  }

  async toggle() {
    if (this.isFullscreen()) {
      await this.exit();
      return;
    }

    await this.enter();
  }

  destroy() {
    document.removeEventListener(
      "fullscreenchange",
      this.handleFullscreenChange,
    );
    this.unlockOrientation();
  }

  /** Attempt to lock screen to landscape on mobile when in fullscreen */
  private async lockOrientation() {
    try {
      const screen = window.screen as Screen & {
        orientation?: {
          lock?: (orientation: string) => Promise<void>;
          unlock?: () => void;
        };
      };
      if (screen.orientation?.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch {
      // Orientation lock is not supported or was denied — fallback silently
    }
  }

  /** Unlock orientation when exiting fullscreen */
  private unlockOrientation() {
    try {
      const screen = window.screen as Screen & {
        orientation?: {
          unlock?: () => void;
        };
      };
      if (screen.orientation?.unlock) {
        screen.orientation.unlock();
      }
    } catch {
      // Orientation unlock not supported — ignore
    }
  }

  private handleFullscreenChange = () => {
    this.onChange(this.isFullscreen());
  };
}
