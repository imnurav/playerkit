/**
 * URL detection utilities for identifying YouTube URLs, HLS (.m3u8) URLs,
 * and progressive MP4 sources, and for extracting their identifiers.
 */

/**
 * Extract the YouTube video ID from a URL or bare 11-character ID.
 * Returns null if it is not a valid YouTube source.
 */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If it's already a bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Match various YouTube URL formats (watch, embed, v, shorts, live, youtu.be, etc.)
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})(?:\S*)?$/;
  const match = trimmed.match(regExp);
  return match?.[1] ?? null;
}

/**
 * Check if a URL string is a YouTube video URL or bare ID.
 */
export function isYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null;
}

/**
 * Check if a URL string is an HLS manifest URL (`.m3u8`).
 *
 * The check is case-insensitive and ignores query strings / fragments so
 * that `https://cdn.example.com/foo.m3u8?token=abc` is still recognised.
 */
export function isHlsUrl(url: string): boolean {
  if (!url) return false;
  return url.toLowerCase().split(/[?#]/)[0]!.endsWith(".m3u8");
}

/**
 * Check if a URL string points to a progressive MP4 (or other
 * natively-playable HTML5 video container) source.
 *
 * We accept the common extensions: .mp4, .m4v, .webm, .ogv, .ogg.
 * Data URIs and blob: URLs are also considered MP4-class since the
 * browser will play them through the same native pipeline.
 */
export function isMp4Url(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Data URIs and blob URLs are loaded by the native pipeline (same as MP4).
  if (/^(data:|blob:)/i.test(trimmed)) return true;

  const path = trimmed.toLowerCase().split(/[?#]/)[0]!;
  return /\.(mp4|m4v|webm|ogv|ogg)$/.test(path);
}

/**
 * Check if a URL is a valid streamable source (non-YouTube).
 */
export function isStreamUrl(url: string): boolean {
  return !isYoutubeUrl(url) && url.trim().length > 0;
}

/**
 * Safe query string extraction.
 * Resolves relative URLs using the browser location base URL.
 */
export function extractQueryString(url: string): string {
  try {
    const base =
      typeof window !== "undefined" ? window.location.href : undefined;
    const urlObj = new URL(url, base);
    return urlObj.search;
  } catch {
    const parts = url.split("?");
    return parts.length > 1 ? "?" + parts[1] : "";
  }
}

/**
 * Appends query parameters from a master query string to a target request URL,
 * preventing double-appending if any of the query keys already exist in the target URL.
 */
export function appendQueryParamsIfMissing(
  url: string,
  masterQueryString: string,
): string {
  if (!masterQueryString) return url;
  const queryString = masterQueryString.startsWith("?")
    ? masterQueryString
    : "?" + masterQueryString;
  const queryKeys = Array.from(new URLSearchParams(queryString).keys());

  const hasParam = queryKeys.some((key) => url.includes(key + "="));
  if (!hasParam) {
    const separator = url.includes("?") ? "&" : "?";
    const cleanQuery = queryString.slice(1);
    return url + separator + cleanQuery;
  }
  return url;
}

/**
 * Appends or replaces query parameters in the target URL using query parameters from the source URL.
 * Preserves relative paths if the original target URL was relative.
 */
export function appendOrReplaceQueryParams(
  url: string,
  sourceUrl: string,
): string {
  if (!sourceUrl) return url;
  try {
    const base =
      typeof window !== "undefined" ? window.location.href : undefined;
    const target = new URL(url, base);
    const source = new URL(sourceUrl, base);

    source.searchParams.forEach((value, key) => {
      target.searchParams.set(key, value);
    });

    const isRelative =
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("//");

    return isRelative
      ? target.pathname + target.search + target.hash
      : target.toString();
  } catch {
    return url;
  }
}
