import type { HlsPlayerProps } from "@playerkit/react";

/** KGS API base URL for fetching video stream tokens. */
const KGS_VIDEO_API = "https://api.khanglobalstudies.com/v4/courses/video";

/**
 * Build a KGS-specific `TokenFetcher` for a given video ID.
 *
 * This is app-layer logic — the `@playerkit/core` library has no knowledge of
 * the KGS API. Pass the returned function as the `tokenFetcher` prop of
 * `<HlsPlayer>` to enable automatic token fetch and refresh.
 *
 * @param videoId  Numeric KGS video ID (e.g. "531385")
 */
export function buildKgsTokenFetcher(
  videoId: string,
): NonNullable<HlsPlayerProps["tokenFetcher"]> {
  return async ({ signal }) => {
    const res = await fetch(`${KGS_VIDEO_API}/${videoId}`, { signal });
    const data = await res.json();
    if (!data.video_url) {
      throw new Error(
        data.message || `API error (status: ${data.status || res.status})`,
      );
    }
    return { url: data.video_url as string };
  };
}
