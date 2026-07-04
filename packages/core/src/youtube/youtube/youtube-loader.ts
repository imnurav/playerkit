import { logger } from "../../utils/logger";

let apiReady = false;
let apiLoading = false;
const readyCallbacks: Array<() => void> = [];

/**
 * Load the YouTube IFrame API script dynamically.
 * Ensures it's only loaded once and handles hot-reloads and existing script tags gracefully.
 */
export function loadYouTubeApi(): Promise<void> {
  // 1. If already ready (or window has YT.Player), resolve immediately.
  if (apiReady || ((window as any).YT && typeof (window as any).YT.Player === "function")) {
    apiReady = true;
    logger.debug("[YoutubeLoader] API already ready");
    return Promise.resolve();
  }

  // 2. If apiLoading is true, queue up.
  if (apiLoading) {
    logger.debug("[YoutubeLoader] API loading, queuing");
    return new Promise((resolve) => readyCallbacks.push(resolve));
  }

  // 3. Check if script is already in document
  const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
  if (existingScript) {
    logger.info("[YoutubeLoader] Script already in DOM, waiting for YT.Player");
    apiLoading = true;
    return new Promise((resolve) => {
      readyCallbacks.push(resolve);
      
      const resolveAll = () => {
        apiReady = true;
        apiLoading = false;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
      };

      // Also register/chain onYouTubeIframeAPIReady callback in case it hasn't fired yet
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") {
          try { prevCallback(); } catch {}
        }
        clearInterval(poll);
        resolveAll();
      };

      // Set up a polling interval in case onYouTubeIframeAPIReady never fires
      const poll = setInterval(() => {
        if ((window as any).YT && typeof (window as any).YT.Player === "function") {
          clearInterval(poll);
          resolveAll();
        }
      }, 50);
    });
  }

  // 4. Otherwise, start a fresh load
  apiLoading = true;
  return new Promise((resolve) => {
    readyCallbacks.push(resolve);

    const resolveAll = () => {
      apiReady = true;
      apiLoading = false;
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
    };

    // Set up polling fallback as well, in case YouTube script loads but callback is lost
    const poll = setInterval(() => {
      if ((window as any).YT && typeof (window as any).YT.Player === "function") {
        clearInterval(poll);
        resolveAll();
      }
    }, 50);

    const prevCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof prevCallback === "function") {
        try { prevCallback(); } catch {}
      }
      clearInterval(poll);
      resolveAll();
    };

    // Create and inject the script tag
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);
    logger.info("[YoutubeLoader] Script tag injected");
  });
}
