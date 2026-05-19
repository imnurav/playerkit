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
    }
  }

  async exit() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
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
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
  }

  private handleFullscreenChange = () => {
    this.onChange(this.isFullscreen());
  };
}
