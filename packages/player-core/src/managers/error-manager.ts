import type { ErrorData } from "hls.js";
import Hls from "hls.js";
import type { PlayerError, PlayerErrorCategory } from "../types/events.types";
import type { PlayerStore } from "../core/store";

/**
 * ErrorManager — single owner of all error creation, classification, and
 * state writing across the player engine.
 *
 * Previously, error construction was scattered:
 *  - inline `PlayerError` literals in `player.ts` (empty src, auth failures, video element errors)
 *  - inline `PlayerError` literals in `network-manager.ts` (offline detection)
 *  - error classification logic in `hls-manager.ts` (HTTP status codes, hls.js error types)
 *
 * This class consolidates all of that into one place so:
 *  1. Error messages are consistent and easy to update.
 *  2. Classification logic lives in one place (no duplication).
 *  3. Managers no longer need to know how to build `PlayerError` shapes.
 *  4. The error emit callback is injected — ErrorManager never directly imports
 *     the EventEmitter, keeping the dependency graph clean.
 */
export class ErrorManager {
  private store: PlayerStore;
  /**
   * Callback to emit the "error" event on the Player's EventEmitter.
   * Injected at construction so ErrorManager has no knowledge of the emitter.
   */
  private onError: (err: PlayerError) => void;

  constructor(store: PlayerStore, onError: (err: PlayerError) => void) {
    this.store = store;
    this.onError = onError;
  }

  // ─── Error Creation Helpers ───────────────────────────────────────────────

  /**
   * Build a structured PlayerError object with a message, category, and
   * optional raw debug payload.
   */
  buildError(
    message: string,
    category: PlayerErrorCategory,
    options?: { details?: string; raw?: PlayerError["raw"] },
  ): PlayerError {
    return {
      message,
      fatal: true,
      category,
      details: options?.details,
      raw: options?.raw,
    };
  }

  // ─── Named Error Factories ────────────────────────────────────────────────

  /** Error for empty / missing stream source URL. */
  emptySourceError(): PlayerError {
    return this.buildError("No video source provided.", "source");
  }

  /** Error for failed token authentication. */
  authError(cause?: unknown): PlayerError {
    const message =
      cause instanceof Error ? cause.message : "Authentication failed.";
    return this.buildError(message, "auth", {
      raw: cause instanceof Error ? cause : undefined,
    });
  }

  /** Error for native HTMLVideoElement media errors (non-hls.js path). */
  mediaElementError(mediaError: MediaError | null): PlayerError {
    return this.buildError(
      mediaError?.message || "Video playback failed.",
      "media",
      { raw: mediaError ?? undefined },
    );
  }

  /** Error for going offline (network disconnect). */
  offlineError(): PlayerError {
    return this.buildError(
      "You appear to be offline. Playback will resume when your connection is restored.",
      "network",
    );
  }

  /**
   * Classify a fatal hls.js `ErrorData` object into a structured `PlayerError`.
   * Maps HTTP status codes and hls.js error types to human-readable messages
   * and semantic `PlayerErrorCategory` values.
   */
  classifyHlsError(data: ErrorData): PlayerError {
    const response = (data as unknown as Record<string, unknown>).response as
      | { code?: number; text?: string }
      | undefined;

    const httpStatus = response?.code ?? 0;
    const responseText = response?.text ?? "";

    let message = "Playback failed. Please try again.";
    let category: PlayerErrorCategory = "unknown";

    if (httpStatus === 404 || responseText.includes("no stream")) {
      message =
        "Stream not found. The URL may be invalid or the stream has ended.";
      category = "source";
    } else if (httpStatus === 401 || httpStatus === 403) {
      message =
        "Access denied. The stream requires a valid authentication token.";
      category = "auth";
    } else if (httpStatus >= 500) {
      message = "The stream server returned an error. Please try again later.";
      category = "server";
    } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
      message = "Cannot connect to the stream. Check your network connection.";
      category = "network";
    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
      message =
        "A media playback error occurred. The stream format may be unsupported.";
      category = "media";
    } else if (
      data.details?.includes("manifest") ||
      data.details?.includes("load")
    ) {
      message =
        "Failed to load the stream manifest. The stream URL may be incorrect.";
      category = "source";
    }

    return this.buildError(message, category, {
      details: data.details,
      raw: data,
    });
  }

  // ─── State + Emit ─────────────────────────────────────────────────────────

  /**
   * Write a fatal error to the player store and emit the "error" event.
   * This is the single call-site for all fatal error propagation.
   */
  raise(err: PlayerError) {
    this.store.setState({ error: err, isBuffering: false });
    this.onError(err);
  }

  /**
   * Clear the current error from the player store.
   * Called by retry() to reset state before reloading the source.
   */
  clear() {
    this.store.setState({ error: null });
  }

  /**
   * Returns true if the current player error is categorized as a network error.
   * Used by NetworkManager to decide whether to auto-retry when connectivity returns.
   */
  isNetworkError(): boolean {
    return this.store.getState().error?.category === "network";
  }
}
