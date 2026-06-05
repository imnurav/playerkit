import type { TokenResult, TokenFetcher } from "../types/player.types";

/**
 * Manages token-based authentication for HLS streams.
 * Handles initial fetch, auto-refresh before expiry, and auth headers via hls.js xhrSetup.
 */
export class AuthManager {
  private tokenFetcher: TokenFetcher;
  private currentToken: TokenResult | null = null;
  private abortController: AbortController | null = null;
  private onTokenRefreshed: ((url: string) => void) | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(tokenFetcher: TokenFetcher) {
    this.tokenFetcher = tokenFetcher;
  }

  /** Update the token fetcher function. */
  updateTokenFetcher(tokenFetcher: TokenFetcher) {
    this.tokenFetcher = tokenFetcher;
  }

  /** Reset internal state and timers without destroying the instance. */
  reset() {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.currentToken = null;
  }

  /** Fetch the initial auth token and schedule auto-refresh. */
  async authenticate(src: string): Promise<TokenResult> {
    this.abortController = new AbortController();
    const result = await this.tokenFetcher({
      src,
      signal: this.abortController.signal,
    });
    this.currentToken = result;

    const expiresIn = result.expiresIn ?? this.parseExpiryFromUrl(result.url);
    if (expiresIn && expiresIn > 0) this.scheduleRefresh(src, expiresIn);
    return result;
  }

  /**
   * Register a pre-signed URL as the current token.
   * Parses its `exp=` timestamp and schedules a background refresh.
   */
  setInitialSignedUrl(url: string) {
    this.currentToken = { url };
    const expiresIn = this.parseExpiryFromUrl(url);
    if (expiresIn && expiresIn > 0) this.scheduleRefresh(url, expiresIn);
  }

  /** Set a callback invoked whenever the token is refreshed. */
  setRefreshCallback(callback: (url: string) => void) {
    this.onTokenRefreshed = callback;
  }

  /** Returns an hls.js xhrSetup function that injects auth headers when present. */
  getXhrSetup(): ((xhr: XMLHttpRequest, url: string) => void) | undefined {
    return (xhr: XMLHttpRequest) => {
      if (this.currentToken?.headers) {
        for (const [key, value] of Object.entries(this.currentToken.headers))
          xhr.setRequestHeader(key, value);
      }
    };
  }

  /** Clean up all timers and abort any in-flight requests. */
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

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Parse the `exp=<unix_timestamp>` from a signed URL and return how many
   * seconds until expiry. Returns undefined if no `exp=` is found.
   */
  private parseExpiryFromUrl(url: string): number | undefined {
    const match = url.match(/exp=(\d+)/);
    if (!match) return undefined;
    const expiryTimestampSec = parseInt(match[1]!, 10);
    const remaining = expiryTimestampSec - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : undefined;
  }

  private scheduleRefresh(src: string, expiresIn: number) {
    if (this.refreshTimer !== null) clearTimeout(this.refreshTimer);
    const ms = Math.max(expiresIn * 0.8, 10) * 1000;
    this.refreshTimer = setTimeout(async () => {
      try {
        const result = await this.authenticate(src);
        this.onTokenRefreshed?.(result.url);
      } catch {
        /* stream continues with current token until hard expiry */
      }
    }, ms);
  }
}
