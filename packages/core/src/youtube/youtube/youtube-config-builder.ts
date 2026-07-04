/**
 * Responsible for constructing the configuration parameters (playerVars)
 * required for the YouTube IFrame player initialization.
 */
export class YoutubeConfigBuilder {
  /**
   * Builds the YouTube configuration object.
   *
   * @param autoPlay True to enable autoplay.
   * @param startTime Optional starting playback position in seconds.
   */
  static build(autoPlay?: boolean, startTime?: number): Record<string, any> {
    const playerVars: Record<string, any> = {
      fs: 0,
      rel: 0,
      controls: 1,
      showinfo: 0,
      disablekb: 1,
      playsinline: 1,
      enablejsapi: 1,
      modestbranding: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
    };

    if (typeof window !== "undefined") {
      if (window.location?.origin) {
        playerVars["origin"] = window.location.origin;
      }
      if (window.location?.href) {
        playerVars["widget_referrer"] = window.location.href;
      }
    }

    if (autoPlay) playerVars["autoplay"] = 1;
    if (startTime) playerVars["start"] = Math.floor(startTime);

    return playerVars;
  }
}
