import { type PlayerControls } from "@nurav/player-core";
import { determinePlayerType } from "./utils/helpers";
import { YoutubePlayer } from "./youtube-player";
import type { KgsPlayerProps } from "./types";
import { HlsPlayer } from "./hls-player";
import { forwardRef } from "react";

/**
 * KgsPlayer — Master orchestrator player component.
 * Automatically inspects the source URL or Video ID to dynamically render the correct
 * media player format (HLS/M3U8 stream vs. YouTube iframe) with full feature parity,
 * controls UI, keyboard support, and devtools protection.
 */
export const KgsPlayer = forwardRef<PlayerControls, KgsPlayerProps>(
  function KgsPlayer(props, ref) {
    const { src, type } = props;

    const playerType = determinePlayerType(src, type);

    if (playerType === "youtube") {
      return <YoutubePlayer ref={ref} {...props} />;
    }

    return <HlsPlayer ref={ref} {...props} />;
  },
);

KgsPlayer.displayName = "KgsPlayer";
export { KgsPlayer as Player };
