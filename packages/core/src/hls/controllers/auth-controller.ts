import type { TokenResult, TokenFetcher, TokenRefresher } from "../../types/player.types";
import { appendOrReplaceQueryParams } from "../../utils/url";

/**
 * Manages fetching, token expiration parsing, and automatic token background refresh scheduling.
 * Provides custom xhrSetup functions for header injections.
 */
export class AuthController {
  private currentToken: TokenResult | null = null;
  private abortController: AbortController | null = null;
  private onTokenRefreshed: ((url: string) => void) | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private tokenFetcher: TokenFetcher,
    private tokenRefresher?: TokenRefresher,
  ) {}

  /** Update the token fetcher strategy. */
  updateTokenFetcher(tokenFetcher: TokenFetcher, tokenRefresher?: TokenRefresher): void {
    this.tokenFetcher = tokenFetcher;
    this.tokenRefresher = tokenRefresher;
  }

  /** Reset internal state and refresh timers without destroying callback references. */
  reset(): void {
    this.clearTimerAndRequests();
    this.currentToken = null;
  }

  /**
   * Fetches auth tokens and schedules refresh tasks before token expiration.
   */
  async authenticate(src: string, isRefresh = false): Promise<TokenResult> {
    this.abortController = new AbortController();
    const fetcher = (isRefresh && this.tokenRefresher) ? this.tokenRefresher : this.tokenFetcher;
    const result = await fetcher({
      src,
      signal: this.abortController.signal,
    });
    this.currentToken = result;

    const expiresIn = result.expiresIn ?? this.parseExpiryFromUrl(result.url);
    if (expiresIn && expiresIn > 0) {
      this.scheduleRefresh(src, expiresIn);
    }
    return result;
  }

  /** Registers pre-signed URL as token, parses expiration, and schedules refresh. */
  setInitialSignedUrl(url: string): void {
    this.currentToken = { url };
    const expiresIn = this.parseExpiryFromUrl(url);
    if (expiresIn && expiresIn > 0) {
      this.scheduleRefresh(url, expiresIn);
    }
  }

  /** Registers callback to trigger when token updates. */
  setRefreshCallback(callback: (url: string) => void): void {
    this.onTokenRefreshed = callback;
  }

  /** Returns custom xhrSetup to inject request headers on request. */
  getXhrSetup(): ((xhr: XMLHttpRequest, url: string) => void) | undefined {
    return (xhr: XMLHttpRequest, url: string) => {
      const headers = this.currentToken?.headers;
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }
      }

      if (this.currentToken?.url) {
        const newUrl = appendOrReplaceQueryParams(url, this.currentToken.url);
        if (newUrl !== url) {
          xhr.open("GET", newUrl, true);
          if (headers) {
            for (const [key, value] of Object.entries(headers)) {
              xhr.setRequestHeader(key, value);
            }
          }
        }
      }
    };
  }

  /** Clean up timer handles, callbacks, and cancel ongoing HTTP requests. */
  destroy(): void {
    this.clearTimerAndRequests();
    this.currentToken = null;
    this.onTokenRefreshed = null;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private clearTimerAndRequests(): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private parseExpiryFromUrl(url: string): number | undefined {
    const match = url.match(/(?:exp|expires|ttl|validto)=(\d+)/i);
    if (!match) return undefined;
    const expiryVal = parseInt(match[1]!, 10);
    if (expiryVal < 86400) {
      return expiryVal;
    }
    const remaining = expiryVal - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : undefined;
  }

  private scheduleRefresh(src: string, expiresIn: number): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
    }
    const ms = Math.max(expiresIn * 0.8, 10) * 1000;
    this.refreshTimer = setTimeout(async () => {
      try {
        const result = await this.authenticate(src, true);
        this.onTokenRefreshed?.(result.url);
      } catch {
        // Retry in 5 seconds on failure
        this.scheduleRefresh(src, 5);
      }
    }, ms);
  }
}
