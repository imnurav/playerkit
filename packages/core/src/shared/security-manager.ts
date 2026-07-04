import type { PlayerControls } from "../types/player.types";
import type { PlayerStore } from "./store";
import { logger } from "../utils/logger";

export type SecurityManagerOptions = {
  root: HTMLElement;
  video?: HTMLVideoElement | null;
  store: PlayerStore;
  controls: Pick<PlayerControls, "play" | "pause">;
  disableDevOptions?: boolean;
};

/**
 * Manages all video security features to prevent copying, downloading, or inspecting
 * streams through developer tools, right clicks, context menus, and developer hotkeys.
 */
export class SecurityManager {
  private root: HTMLElement;
  private video: HTMLVideoElement | null;
  private store: PlayerStore;
  private controls: SecurityManagerOptions["controls"];
  private disableDevOptions: boolean;

  private checkIntervalId: ReturnType<typeof setInterval> | null = null;
  private resizeListener: (() => void) | null = null;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private contextMenuListener: ((e: MouseEvent) => void) | null = null;
  private dragStartListener: ((e: DragEvent) => void) | null = null;
  private isDetected = false;

  constructor(options: SecurityManagerOptions) {
    this.root = options.root;
    this.video = options.video ?? null;
    this.store = options.store;
    this.controls = options.controls;
    this.disableDevOptions = options.disableDevOptions ?? false;

    if (this.disableDevOptions) {
      this.activateSecurity();
    }
  }

  destroy() {
    this.deactivateSecurity();
  }

  private activateSecurity() {
    // 1. Disable Right-Click Context Menu globally
    this.contextMenuListener = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("contextmenu", this.contextMenuListener, true);

    // 2. Disable Dragstart globally (e.g. poster image or video stream node dragging)
    this.dragStartListener = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("dragstart", this.dragStartListener, true);

    // 3. Apply CSS styles dynamically to root and video elements
    this.root.style.setProperty("user-select", "none");
    this.root.style.setProperty("-webkit-user-select", "none");
    this.root.style.setProperty("-moz-user-select", "none");
    this.root.style.setProperty("-ms-user-select", "none");
    this.root.style.setProperty("-webkit-touch-callout", "none");
    this.video?.style.setProperty("pointer-events", "none");

    // 4. Disable DevTools key combinations (F12, Inspect, Element Picker, Source, Save)
    this.keydownListener = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform);

      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const isOptOrAlt = e.altKey;
      const isShift = e.shiftKey;

      let block = false;

      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        block = true;
      }

      // Inspect element (Cmd+Opt+I / Ctrl+Shift+I)
      if (isCmdOrCtrl && isShift && e.key?.toLowerCase() === "i") {
        block = true;
      }
      if (isMac && isCmdOrCtrl && isOptOrAlt && e.key?.toLowerCase() === "i") {
        block = true;
      }

      // Console Panel (Cmd+Opt+J / Ctrl+Shift+J)
      if (isCmdOrCtrl && isShift && e.key?.toLowerCase() === "j") {
        block = true;
      }
      if (isMac && isCmdOrCtrl && isOptOrAlt && e.key?.toLowerCase() === "j") {
        block = true;
      }

      // Element Selection Tool (Cmd+Opt+C / Ctrl+Shift+C)
      if (isCmdOrCtrl && isShift && e.key?.toLowerCase() === "c") {
        block = true;
      }
      if (isMac && isCmdOrCtrl && isOptOrAlt && e.key?.toLowerCase() === "c") {
        block = true;
      }

      // View Source (Cmd+Opt+U / Ctrl+U)
      if (isCmdOrCtrl && e.key?.toLowerCase() === "u") {
        block = true;
      }
      if (isMac && isCmdOrCtrl && isOptOrAlt && e.key?.toLowerCase() === "u") {
        block = true;
      }

      // Save Page (Cmd+S / Ctrl+S)
      if (isCmdOrCtrl && e.key?.toLowerCase() === "s") {
        block = true;
      }

      if (block) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", this.keydownListener, true);

    // 5. Active Defense: DevTools detection checking
    this.startDevToolsCheck();
  }

  private deactivateSecurity() {
    if (this.contextMenuListener) {
      document.removeEventListener(
        "contextmenu",
        this.contextMenuListener,
        true,
      );
    }
    if (this.dragStartListener) {
      document.removeEventListener("dragstart", this.dragStartListener, true);
    }
    if (this.keydownListener) {
      window.removeEventListener("keydown", this.keydownListener, true);
    }
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }

    this.root.style.removeProperty("user-select");
    this.root.style.removeProperty("-webkit-user-select");
    this.root.style.removeProperty("-moz-user-select");
    this.root.style.removeProperty("-ms-user-select");
    this.root.style.removeProperty("-webkit-touch-callout");
    this.video?.style.removeProperty("pointer-events");
  }

  private startDevToolsCheck() {
    const threshold = 250;

    // 5a. Window resizing check (detects docked DevTools panels on left/right)
    this.resizeListener = () => {
      if (typeof window === "undefined") return;
      const widthDifference = window.outerWidth - window.innerWidth;

      if (widthDifference > threshold) {
        this.onDevtoolsDetected("window-resize");
      }
    };
    window.addEventListener("resize", this.resizeListener);

    // 5b. Periodic debugger breakpoint timing loops
    this.checkIntervalId = setInterval(() => {
      if (typeof window === "undefined") return;

      // Debugger breakpoint timing trap
      const startTime = performance.now();
      debugger; // code halts execution here if inspector console is open
      const duration = performance.now() - startTime;

      const isDebuggerHalting = duration > 200;
      const widthDifference = window.outerWidth - window.innerWidth;
      const isWidthExceeded = widthDifference > threshold;

      if (isDebuggerHalting) {
        this.onDevtoolsDetected("debugger-trap");
      } else if (isWidthExceeded) {
        this.onDevtoolsDetected("window-resize-interval");
      } else {
        // Both are false! DevTools has been closed!
        this.onDevtoolsCleared();
      }
    }, 1000);
  }

  private onDevtoolsDetected(reason: string) {
    if (this.isDetected) return;
    this.isDetected = true;

    logger.warn(
      `[Security] Developer Tools Detected via ${reason}. Securing stream.`,
    );

    // 1. Pause video playback instantly
    this.controls.pause();

    // 2. Set state in player store
    this.store.setState({ isDevtoolsDetected: true });
  }

  private onDevtoolsCleared() {
    if (!this.isDetected) return;
    this.isDetected = false;

    logger.info(`[Security] Developer Tools Closed. Resuming stream.`);

    // 1. Set state in player store
    this.store.setState({ isDevtoolsDetected: false });

    // 2. Play video playback instantly to resume the stream
    this.controls.play().catch((err) => {
      logger.warn(
        "[Security] Auto-play after DevTools close was prevented:",
        err,
      );
    });
  }
}
