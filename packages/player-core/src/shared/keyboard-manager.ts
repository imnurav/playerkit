import type { PlayerControls } from "../types/player.types";

type KeyboardManagerOptions = {
  target: HTMLElement;
  controls: Pick<
    PlayerControls,
    | "togglePlay"
    | "seek"
    | "mute"
    | "unmute"
    | "toggleFullscreen"
    | "toggleStretch"
    | "setVolume"
  >;
  getCurrentTime: () => number;
  getMuted: () => boolean;
  getVolume: () => number;
};

export class KeyboardManager {
  private target: HTMLElement;
  private controls: KeyboardManagerOptions["controls"];
  private getCurrentTime: KeyboardManagerOptions["getCurrentTime"];
  private getMuted: KeyboardManagerOptions["getMuted"];
  private getVolume: KeyboardManagerOptions["getVolume"];

  constructor(options: KeyboardManagerOptions) {
    this.target = options.target;
    this.controls = options.controls;
    this.getCurrentTime = options.getCurrentTime;
    this.getMuted = options.getMuted;
    this.getVolume = options.getVolume;

    this.target.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    this.target.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.repeat ||
      this.isEditableTarget(event.target)
    ) {
      return;
    }

    switch (event.key) {
      case " ":
      case "Spacebar":
        event.preventDefault();
        void this.controls.togglePlay();
        return;

      case "ArrowLeft":
        event.preventDefault();
        this.controls.seek(this.getCurrentTime() - 10);
        return;

      case "ArrowRight":
        event.preventDefault();
        this.controls.seek(this.getCurrentTime() + 10);
        return;
    }

    switch (event.key.toLowerCase()) {
      case "m":
        event.preventDefault();
        if (this.getMuted()) {
          this.controls.unmute();
        } else {
          this.controls.mute();
        }
        return;

      case "f":
        event.preventDefault();
        void this.controls.toggleFullscreen();
        return;

      case "s":
        event.preventDefault();
        this.controls.toggleStretch();
        return;

      case "arrowup":
        event.preventDefault();
        this.controls.setVolume(Math.min(this.getVolume() + 0.1, 1));
        return;

      case "arrowdown":
        event.preventDefault();
        this.controls.setVolume(Math.max(this.getVolume() - 0.1, 0));
        return;
    }
  };

  private isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();

    return (
      target.isContentEditable ||
      tagName === "button" ||
      tagName === "input" ||
      tagName === "select" ||
      tagName === "textarea"
    );
  }
}
