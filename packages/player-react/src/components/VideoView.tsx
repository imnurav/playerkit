import { forwardRef, type VideoHTMLAttributes, memo } from "react";

export type VideoViewProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "controls" | "playsInline"
> & {
  videoClassName?: string;
  poster?: string;
  objectFit?: "contain" | "cover" | "fill";
};

export const VideoView = memo(
  forwardRef<HTMLVideoElement, VideoViewProps>(function VideoView(
    { videoClassName, poster, objectFit = "contain", ...videoProps },
    ref,
  ) {
    return (
      <>
        <video
          ref={ref}
          className={["vp-player__video", videoClassName]
            .filter(Boolean)
            .join(" ")}
          controls={false}
          playsInline
          poster={poster}
          style={{ objectFit }}
          {...videoProps}
        />

        {/* Invisible tap layer */}
        <div className="vp-tap-layer" aria-hidden="true" />
      </>
    );
  }),
);
