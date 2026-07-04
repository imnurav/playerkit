import type { ErrorManager } from "../../shared/error-manager";
import Hls, { type ErrorData } from "hls.js";

/**
 * Handles automatic HLS.js error recovery strategies (recovering media/network issues).
 * Delegates to the ErrorManager when errors are unrecoverable.
 */
export class HlsRecoveryManager {
  private recoverAttempted = false;

  constructor(private readonly errorManager: ErrorManager) {}

  /** Reset the recovery status flag. */
  reset(): void {
    this.recoverAttempted = false;
  }

  /**
   * Attempts automatic recovery for a fatal HLS.js error.
   * If recovery is not possible or has already failed once, delegates the classified error to ErrorManager.
   *
   * @param hls The current active Hls.js instance.
   * @param data HLS.js error payload.
   */
  handleFatalError(hls: Hls, data: ErrorData): void {
    if (!this.recoverAttempted) {
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        this.recoverAttempted = true;
        hls.recoverMediaError();
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        const isManifestError =
          data.details === "manifestLoadError" ||
          data.details === "manifestLoadTimeOut" ||
          data.details === "manifestParsingError";

        if (!isManifestError) {
          this.recoverAttempted = true;
          hls.startLoad(-1);
          return;
        }
      }
    }

    // Unrecoverable -> classify and raise
    const classified = this.errorManager.classifyHlsError(data);
    this.errorManager.raise(classified);
  }
}
