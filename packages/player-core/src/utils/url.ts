/**
 * URL detection utilities for identifying YouTube URLs
 * and extracting video IDs.
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

  return match ? match[1] : null;
}

/**
 * Check if a URL string is a YouTube video URL or bare ID.
 */
export function isYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null;
}

/**
 * Check if a URL is a valid streamable source (non-YouTube).
 */
export function isStreamUrl(url: string): boolean {
  return !isYoutubeUrl(url) && url.trim().length > 0;
}
