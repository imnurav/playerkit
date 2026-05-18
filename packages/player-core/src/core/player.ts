import type { CreatePlayerOptions } from "../types/player.types";
import { EventEmitter } from "./events";
import { createHls } from "./hls";

export class Player extends EventEmitter {
  private video: HTMLVideoElement;
  private src: string;

  constructor(options: CreatePlayerOptions) {
    super();

    this.video = options.video;
    this.src = options.src;

    createHls(this.video, this.src);

    this.attachEvents();
  }

  private attachEvents() {
    this.video.addEventListener("play", () => {
      this.emit("play");
    });

    this.video.addEventListener("pause", () => {
      this.emit("pause");
    });
  }

  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }

  seek(time: number) {
    this.video.currentTime = time;
  }

  destroy() {
    this.video.pause();
    this.video.src = "";
  }
}
