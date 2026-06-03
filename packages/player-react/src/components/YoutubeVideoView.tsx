import { TouchDiagnosticOverlay } from "./TouchDiagnosticOverlay";
import { forwardRef, memo, useState, useEffect } from "react";
import { SecurityLockOverlay } from "./SecurityLockOverlay";
import { SeekFeedbackOverlay } from "./SeekFeedbackOverlay";
import { CenterPlayFeedback } from "./CenterPlayFeedback";
import type { YoutubeVideoViewProps } from "../types";
import { BufferingSpinner } from "./BufferingSpinner";
import { ErrorOverlay } from "./ErrorOverlay";

/**
 * YoutubeVideoView - A highly performant, memoized sub-component that contains
 * the YouTube iframe injection clip along with all overlay UI views (security, buffering,
 * error state, and interactive tap zones).
 */

export const YoutubeVideoView = memo(
  forwardRef<HTMLDivElement, YoutubeVideoViewProps>(
    function YoutubeVideoView(props, ref) {
      const {
        error,
        player,
        posterUrl,
        centerZoneX,
        centerZoneY,
        seekFeedback,
        videoId = "",
        centerPlayFeedback,
        showPoster = false,
        isBuffering = false,
        debugTouchZones = false,
        isDevtoolsDetected = false,
      } = props;

      // Track active poster source in state to prevent React Virtual DOM from resetting fallback src
      const [imgSrc, setImgSrc] = useState(posterUrl || "");

      useEffect(() => {
        setImgSrc(posterUrl || "");
      }, [posterUrl]);

      const handleImageError = () => {
        if (imgSrc.includes("maxresdefault.jpg")) {
          setImgSrc(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
        } else if (imgSrc.includes("mqdefault.jpg")) {
          setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        }
      };

      return (
        <div className="vp-player__clip">
          {/* YouTube iframe injected here by YoutubeManager */}
          <div ref={ref} data-youtube-clip className="vp-youtube-clip" />

          {/* Poster Image Overlay */}
          {imgSrc && (
            <div
              className="vp-youtube-poster"
              data-visible={showPoster ? "true" : "false"}
              style={{
                opacity: showPoster ? 1 : 0,
                visibility: showPoster ? "visible" : "hidden",
                transition: "opacity 300ms ease, visibility 300ms ease",
              }}
            >
              <img
                src={imgSrc}
                alt="Video Poster"
                className="vp-youtube-poster__image"
                style={{ objectFit: "cover" }}
                onError={handleImageError}
              />
            </div>
          )}

          {/* Invisible tap layer to intercept touch/mouse events and prevent them from hitting the iframe */}
          <div className="vp-tap-layer" aria-hidden="true" />

          {/* Reusable Security Lock Overlay */}
          <SecurityLockOverlay isActive={isDevtoolsDetected} />

          {/* Modular Buffering Spinner */}
          <BufferingSpinner
            isBuffering={isBuffering}
            hasError={!!error?.fatal}
          />

          {/* Error Overlay */}
          <ErrorOverlay error={error} onRetry={() => player?.retry()} />

          {/* Seek Feedback */}
          <SeekFeedbackOverlay feedback={seekFeedback} />

          {/* Center Play/Pause Feedback */}
          <CenterPlayFeedback feedback={centerPlayFeedback} />

          {/* Visual Touch Diagnostic Overlay */}
          <TouchDiagnosticOverlay
            centerZoneX={centerZoneX}
            centerZoneY={centerZoneY}
            isActive={debugTouchZones}
          />

          <div className="vp-player__gradient" />
        </div>
      );
    },
  ),
);

YoutubeVideoView.displayName = "YoutubeVideoView";
