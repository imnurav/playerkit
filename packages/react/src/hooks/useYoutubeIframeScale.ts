import { useEffect, type RefObject } from "react";

/**
 * Custom hook to dynamically calculate and update the YouTube iframe and wrapper layout
 * for "contain", "cover", and "fill" modes, preventing layout clashing and incorrect sizes.
 */
export function useYoutubeIframeScale(
  rootRef: RefObject<HTMLDivElement | null>,
  objectFit: "contain" | "cover" | "fill",
  isReady: boolean | undefined,
): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateScale = () => {
      const wrapper = root.querySelector<HTMLDivElement>("[data-yt-wrapper]");
      const iframe = root.querySelector<HTMLIFrameElement>(
        "[data-yt-wrapper] iframe",
      );
      if (!wrapper || !iframe) return;

      const rect = root.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      if (containerWidth <= 0 || containerHeight <= 0) return;

      let w = containerWidth;
      let h = containerHeight;
      let top = 0;
      let left = 0;

      const videoRatio = 16 / 9;
      const containerRatio = containerWidth / containerHeight;

      if (objectFit === "contain") {
        if (containerRatio > videoRatio) {
          // Container is wider than 16:9 (landscape) -> fit height
          h = containerHeight;
          w = h * videoRatio;
          left = (containerWidth - w) / 2;
        } else {
          // Container is taller than 16:9 (portrait) -> fit width
          w = containerWidth;
          h = w / videoRatio;
          top = (containerHeight - h) / 2;
        }
      } else if (objectFit === "cover") {
        if (containerRatio > videoRatio) {
          // Container is wider than 16:9 -> cover width (crop height)
          w = containerWidth;
          h = w / videoRatio;
          top = (containerHeight - h) / 2;
        } else {
          // Container is taller than 16:9 -> cover height (crop width)
          h = containerHeight;
          w = h * videoRatio;
          left = (containerWidth - w) / 2;
        }
      }

      // Apply wrapper dimensions & position to match desired objectFit scaling
      wrapper.style.setProperty("width", `${w.toFixed(2)}px`, "important");
      wrapper.style.setProperty("height", `${h.toFixed(2)}px`, "important");
      wrapper.style.setProperty("top", `${top.toFixed(2)}px`, "important");
      wrapper.style.setProperty("left", `${left.toFixed(2)}px`, "important");
      wrapper.style.setProperty("transform", "none", "important");

      // Apply vertical stretch inside iframe ONLY for "fill" mode
      if (objectFit === "fill") {
        const scaleY = (16 / 9) * (h / w);
        iframe.style.setProperty(
          "transform",
          `translateY(-50%) scaleY(${scaleY.toFixed(6)})`,
          "important",
        );
      } else {
        iframe.style.setProperty("transform", "translateY(-50%)", "important");
      }
    };

    updateScale();

    // Listen for window resize
    window.addEventListener("resize", updateScale);

    // Also use ResizeObserver for precision element-level resize detection
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(root);
    }

    return () => {
      window.removeEventListener("resize", updateScale);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [objectFit, isReady, rootRef]);
}
