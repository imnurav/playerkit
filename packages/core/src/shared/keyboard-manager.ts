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
    | "setPlaybackRate"
  >;
  getCurrentTime: () => number;
  getMuted: () => boolean;
  getVolume: () => number;
  getPlaybackRate: () => number;
};

export class KeyboardManager {
  private target: HTMLElement;
  private controls: KeyboardManagerOptions["controls"];
  private getCurrentTime: KeyboardManagerOptions["getCurrentTime"];
  private getMuted: KeyboardManagerOptions["getMuted"];
  private getVolume: KeyboardManagerOptions["getVolume"];
  private getPlaybackRate: KeyboardManagerOptions["getPlaybackRate"];

  constructor(options: KeyboardManagerOptions) {
    this.target = options.target;
    this.controls = options.controls;
    this.getCurrentTime = options.getCurrentTime;
    this.getMuted = options.getMuted;
    this.getVolume = options.getVolume;
    this.getPlaybackRate = options.getPlaybackRate;

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

    // Shift + > or Shift + <
    if (event.shiftKey) {
      if (event.key === ">" || event.key === ".") {
        event.preventDefault();
        this.adjustPlaybackRate(1);
        return;
      }
      if (event.key === "<" || event.key === ",") {
        event.preventDefault();
        this.adjustPlaybackRate(-1);
        return;
      }
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

  private adjustPlaybackRate(direction: -1 | 1) {
    const rates = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentRate = this.getPlaybackRate();
    let index = rates.indexOf(currentRate);
    if (index === -1) {
      index = rates.findIndex((r) => r >= currentRate);
      if (index === -1) index = rates.length - 1;
    }
    const nextIndex = Math.min(
      Math.max(index + direction, 0),
      rates.length - 1,
    );
    this.controls.setPlaybackRate(rates[nextIndex] ?? 1.0);
  }

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
