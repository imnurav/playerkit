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
