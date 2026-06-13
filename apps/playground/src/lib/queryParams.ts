/**
 * Known player query parameter names used as lookahead anchors when parsing
 * the `src` value. This prevents splitting on `&` characters that are part of
 * a CDN-signed URL (e.g. Akamai `&hdnts=…` tokens) rather than top-level params.
 */
const PLAYER_PARAM_NAMES = [
  // Player Configuration parameters
  "accentColor", "lowLatency", "autoPlay", "muted", "customRates", "disableDevOptions",
  "debugTouchZones", "poster", "seekStep", "liveSyncDuration", "volumeControl",
  "centerOverlayGap", "objectFit", "centerIconScale", "safeAreaTop", "safeAreaBottom",
  "videoId", "useTokenAuth", "showPlayButton", "showTimeDisplay", "showSettings",
  "showFullscreen", "showCenterOverlay", "showObjectFitButton", "mobileShowCenterOverlay",

  // Tracking & common campaign/ad parameters (case-insensitive matches)
  "utm_[a-zA-Z0-9_]+", "gclid", "fbclid", "hello", "ads", "test", "debug"
].join("|");

const SRC_CAPTURE_REGEX = new RegExp(
  `src=([\\s\\S]*?)(?:&(?:${PLAYER_PARAM_NAMES})(?:=|$|&)|$)`,
  "i"
);

/**
 * Safely decode a URL-encoded query parameter value.
 * Always attempts `decodeURIComponent`; falls back to the original string on
 * malformed sequences (e.g. a literal `%` not followed by two hex digits).
 */
export function decodeQueryParam(val: string): string {
  if (val.startsWith("http://") || val.startsWith("https://")) {
    return val;
  }
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
}

/**
 * Extract the raw `src` value from a query string using a regex that captures
 * everything up to the next known player parameter or end-of-string.
 * This correctly handles signed CDN URLs whose query strings contain bare `&`
 * characters (e.g. `&hdntl=…&hdnts=…`).
 */
function extractSrcFromQuery(query: string): string | undefined {
  const match = query.match(SRC_CAPTURE_REGEX);
  return match?.[1] !== undefined ? decodeQueryParam(match[1]) : undefined;
}

/**
 * Build a merged `URLSearchParams` from both `window.location.search` and the
 * query portion of `window.location.hash` (e.g. `#/player?src=…`).
 *
 * The `src` parameter is extracted with a regex lookahead so that inner `&`
 * characters in CDN-signed URLs are not mis-treated as param separators.
 */
export function getMergedQueryParams(): URLSearchParams {
  const params = new URLSearchParams(window.location.search);

  // Standard search (before `#`)
  const search = window.location.search;
  if (search) {
    const src = extractSrcFromQuery(search.slice(1)); // strip leading `?`
    if (src !== undefined) params.set("src", src);
  }

  // Hash-based routing (e.g. `#/player?src=…`)
  const href = window.location.href;
  const hashIndex = href.indexOf("#");
  const hash = hashIndex !== -1 ? href.slice(hashIndex) : "";
  const qIndex = hash.indexOf("?");
  if (qIndex !== -1) {
    const hashQuery = hash.slice(qIndex + 1);

    // First pass: standard parse for non-src params
    for (const [key, value] of new URLSearchParams(hashQuery).entries()) {
      if (key !== "src") params.set(key, value);
    }

    // Second pass: regex capture for src (preserves inner `&` in signed URLs)
    const src = extractSrcFromQuery(hashQuery);
    if (src !== undefined) params.set("src", src);
  }

  return params;
}

/** Strip surrounding single or double quotes from a string, if present. */
export function stripQuotes(val: string): string {
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    return val.slice(1, -1);
  }
  return val;
}
