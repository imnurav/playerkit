import type { HlsConfig } from "hls.js";
import {
  appendQueryParamsIfMissing,
  extractQueryString,
} from "../../utils/url";

/**
 * Responsible for constructing the configuration object required for hls.js initialization.
 * Isolates settings for low-latency playback and query parameter propagation.
 */
export class HlsConfigBuilder {
  /**
   * Builds the HLS.js configuration.
   *
   * @param streamUrl The streaming source URL.
   * @param lowLatency True to enable low-latency HLS tuning.
   * @param customXhrSetup Optional callback to inspect or modify XMLHttpRequests.
   */
  static build(
    streamUrl: string,
    lowLatency: boolean,
    customXhrSetup: ((xhr: XMLHttpRequest, url: string) => void) | null,
  ): Partial<HlsConfig> {
    const config: Partial<HlsConfig> = { liveSyncDurationCount: 3 };

    if (lowLatency) {
      Object.assign(config, {
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
    }

    const queryString = extractQueryString(streamUrl);

    config.xhrSetup = (xhr: XMLHttpRequest, url: string) => {
      const newUrl = appendQueryParamsIfMissing(url, queryString);
      if (newUrl !== url) xhr.open("GET", newUrl, true);
      if (customXhrSetup) customXhrSetup(xhr, url);
    };

    return config;
  }
}
