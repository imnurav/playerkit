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

  /** Fetch the initial auth token and return the result. */
  async authenticate(src: string): Promise<TokenResult> {
    this.abortController = new AbortController();
    const result = await this.tokenFetcher({
      src,
      signal: this.abortController.signal,
    });
    this.currentToken = result;
    if (result.expiresIn && result.expiresIn > 0)
      this.scheduleRefresh(src, result.expiresIn);
    return result;
  }

  /** Set a callback for automatic token refresh. */
  setRefreshCallback(callback: (url: string) => void) {
    this.onTokenRefreshed = callback;
  }

  /** Get xhrSetup for hls.js config to apply auth headers. */
  getXhrSetup(): ((xhr: XMLHttpRequest, url: string) => void) | undefined {
    if (!this.currentToken?.headers) return undefined;
    const headers = this.currentToken.headers;
    return (xhr: XMLHttpRequest) => {
      for (const [key, value] of Object.entries(headers))
        xhr.setRequestHeader(key, value);
    };
  }

  /** Clean up timers and abort pending requests. */
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

  private scheduleRefresh(src: string, expiresIn: number) {
    if (this.refreshTimer !== null) clearTimeout(this.refreshTimer);
    const ms = Math.max(expiresIn * 0.8, 10) * 1000;
    this.refreshTimer = setTimeout(async () => {
      try {
        const result = await this.authenticate(src);
        this.onTokenRefreshed?.(result.url);
      } catch {
        /* stream continues with current token */
      }
    }, ms);
  }
}
