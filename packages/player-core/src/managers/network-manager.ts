import type { ErrorManager } from "./error-manager";

/**
 * NetworkManager — watches browser online/offline events and surfaces
 * network connectivity errors through the centralized ErrorManager.
 *
 * When the browser goes offline, raises a fatal network error.
 * When connectivity returns, triggers a retry if the current error was network-related.
 */
export class NetworkManager {
  private errorManager: ErrorManager;
  /** Callback to retry loading the current source (provided by Player). */
  private onRetry: () => void;
  private cleanup: (() => void) | null = null;

  constructor(errorManager: ErrorManager, onRetry: () => void) {
    this.errorManager = errorManager;
    this.onRetry = onRetry;
  }

  /** Attach online/offline event listeners to the browser window. */
  attach() {
    const handleOffline = () => {
      this.errorManager.raise(this.errorManager.offlineError());
    };

    const handleOnline = () => {
      // Only retry if the current error was caused by going offline.
      // We call the public `isNetworkError()` helper to avoid accessing
      // the store directly from NetworkManager.
      if (this.errorManager.isNetworkError()) {
        this.onRetry();
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    this.cleanup = () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }

  destroy() {
    this.cleanup?.();
  }
}
