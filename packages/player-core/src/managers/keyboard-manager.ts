import type { PlayerControls } from "../types/player.types";

type KeyboardManagerOptions = {
  target: HTMLElement;
  controls: Pick<
    PlayerControls,
    "togglePlay" | "seek" | "mute" | "unmute" | "toggleFullscreen"
  >;
  getCurrentTime: () => number;
  getMuted: () => boolean;
};

export class KeyboardManager {
  private target: HTMLElement;
  private controls: KeyboardManagerOptions["controls"];
  private getCurrentTime: KeyboardManagerOptions["getCurrentTime"];
  private getMuted: KeyboardManagerOptions["getMuted"];

  constructor(options: KeyboardManagerOptions) {
    this.target = options.target;
    this.controls = options.controls;
    this.getCurrentTime = options.getCurrentTime;
    this.getMuted = options.getMuted;

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

    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      if (this.getMuted()) {
        this.controls.unmute();
      } else {
        this.controls.mute();
      }
    }

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      void this.controls.toggleFullscreen();
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
