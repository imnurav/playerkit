import type { VideoViewProps } from "../types";
import { forwardRef, memo } from "react";

export const VideoView = memo(
  forwardRef<HTMLVideoElement, VideoViewProps>(function VideoView(props, ref) {
    const {
      videoClassName,
      poster,
      objectFit = "contain",
      ...videoProps
    } = props;
    return (
      <>
        <video
          ref={ref}
          className={["pk-player__video", videoClassName]
            .filter(Boolean)
            .join(" ")}
          controls={false}
          playsInline
          poster={poster}
          style={{ objectFit }}
          {...videoProps}
        />

        {/* Invisible tap layer */}
        <div className="pk-tap-layer" aria-hidden="true" />
      </>
    );
  }),
);

VideoView.displayName = "VideoView";
