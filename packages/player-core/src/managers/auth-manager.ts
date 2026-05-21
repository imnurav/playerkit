import type {
  TokenResult,
  TokenFetcher,
  TokenFetcherOptions,
} from "../types/player.types";

/**
 * Manages token-based authentication for HLS streams.
 *
 * Supports any token API (Akamai EdgeAuth, custom APIs, etc.) via a generic
 * `TokenFetcher` callback. Handles:
 * - Initial token fetch before stream load
 * - Automatic token refresh before expiry
 * - Optional per-request auth headers via HLS.js xhrSetup
 */
export class AuthManager {
  private tokenFetcher: TokenFetcher;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private currentToken: TokenResult | null = null;
  private abortController: AbortController | null = null;
  private onTokenRefreshed: ((url: string) => void) | null = null;

  constructor(tokenFetcher: TokenFetcher) {
    this.tokenFetcher = tokenFetcher;
  }

  /**
   * Fetch the initial authentication token and return the authenticated URL.
   * Call this before loading the HLS source.
   */
  async authenticate(src: string): Promise<TokenResult> {
    this.abortController = new AbortController();

    const options: TokenFetcherOptions = {
      src,
      signal: this.abortController.signal,
    };

    const result = await this.tokenFetcher(options);
    this.currentToken = result;

    // Schedule automatic refresh if the token has an expiry
    if (result.expiresIn && result.expiresIn > 0) {
      this.scheduleRefresh(src, result.expiresIn);
    }

    return result;
  }

  /**
   * Set a callback to be called when the token is automatically refreshed.
   * The callback receives the new authenticated URL.
   */
  setRefreshCallback(callback: (url: string) => void) {
    this.onTokenRefreshed = callback;
  }

  /**
   * Returns an xhrSetup function for HLS.js config that applies
   * any auth headers from the current token.
   */
  getXhrSetup(): ((xhr: XMLHttpRequest, url: string) => void) | undefined {
    if (!this.currentToken?.headers) {
      return undefined;
    }

    const headers = this.currentToken.headers;

    return (xhr: XMLHttpRequest, _url: string) => {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    };
  }

  /**
   * Get the current authenticated URL, or null if not yet authenticated.
   */
  getCurrentUrl(): string | null {
    return this.currentToken?.url ?? null;
  }

  /**
   * Clean up refresh timers and abort pending requests.
   */
  destroy() {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.currentToken = null;
    this.onTokenRefreshed = null;
  }

  /**
   * Schedule a token refresh at 80% of the expiry time.
   * This provides a safety margin to ensure the token is refreshed
   * before it actually expires.
   */
  private scheduleRefresh(src: string, expiresIn: number) {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh at 80% of the expiry time, with a minimum of 10 seconds
    const refreshIn = Math.max(expiresIn * 0.8, 10) * 1000;

    this.refreshTimer = setTimeout(async () => {
      try {
        const result = await this.authenticate(src);

        if (this.onTokenRefreshed) {
          this.onTokenRefreshed(result.url);
        }
      } catch {
        // Token refresh failed — the stream will continue with the
        // current (possibly expired) token. The next segment request
        // will fail and HLS.js error handling will kick in.
      }
    }, refreshIn);
  }
}
