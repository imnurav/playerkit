import type { TokenFetcher, TokenRefresher } from "@playerkit/react";

/** KGS API base URL for fetching video stream tokens. */
const KGS_VIDEO_API = "https://api.khanglobalstudies.com/v4/courses/video";

/**
 * Build a KGS-specific `TokenFetcher` for a given video ID.
 * Pass the returned function as the `tokenFetcher` prop of
 * `<Player>` to enable initial token fetch.
 *
 * @param videoId  Numeric KGS video ID (e.g. "531385")
 * @param authToken Optional Authorization header token (e.g. Bearer token)
 */
export function buildKgsTokenFetcher(
  videoId: string,
  authToken?: string,
): TokenFetcher {
  return async ({ signal }) => {
    const headers: Record<string, string> = {};
    if (authToken && authToken.trim()) {
      headers["Authorization"] = authToken.trim();
    }

    const res = await fetch(`${KGS_VIDEO_API}/${videoId}`, {
      signal,
      headers,
    });
    const data = await res.json();
    if (!data.video_url) {
      throw new Error(
        data.message || `API error (status: ${data.status || res.status})`,
      );
    }
    return {
      url: data.video_url as string,
    };
  };
}

/**
 * Build a KGS-specific `TokenRefresher` for a given video ID.
 * Pass the returned function as the `tokenRefresher` prop of
 * `<Player>` to enable background token refresh.
 *
 * @param videoId  Numeric KGS video ID (e.g. "531385")
 * @param authToken Optional Authorization header token (e.g. Bearer token)
 */
export function buildKgsTokenRefresher(
  videoId: string,
  authToken?: string,
): TokenRefresher {
  return async ({ signal }) => {
    const headers: Record<string, string> = {};
    if (authToken && authToken.trim()) {
      headers["Authorization"] = authToken.trim();
    }

    const response = await fetch(
      `${KGS_VIDEO_API}/${videoId}/refresh-token?expiry=30`,
      {
        signal,
        headers,
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      url: data.video_url,
      expiresIn: 30, // Reschedule next refresh in 30 seconds
    };
  };
}
