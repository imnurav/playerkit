/**
 * URL detection utilities for identifying YouTube URLs
 * and extracting video IDs.
 */

/** Common YouTube URL patterns. */
const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?$/;

/**
 * Check if a URL string is a YouTube video URL.
 */
export function isYoutubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url.trim());
}

/**
 * Extract the YouTube video ID from a URL.
 * Returns null if the URL is not a valid YouTube URL.
 */
export function extractYoutubeId(url: string): string | null {
  const match = url.trim().match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

/**
 * Check if a URL is a valid streamable source (non-YouTube).
 */
export function isStreamUrl(url: string): boolean {
  return !isYoutubeUrl(url) && url.trim().length > 0;
}
