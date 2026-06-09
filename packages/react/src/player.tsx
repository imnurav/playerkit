import { type PlayerControls } from "@playerkit/core";
import { determinePlayerType } from "./utils/helpers";
import { YoutubePlayer } from "./youtube-player";
import type { PlayerProps } from "./types";
import { HlsPlayer } from "./hls-player";
import { Mp4Player } from "./mp4-player";
import { forwardRef } from "react";

/**
 * Player — Master orchestrator player component.
 * Automatically inspects the source URL or Video ID to dynamically render
 * the correct media player format (HLS/M3U8 stream, progressive MP4, or
 * YouTube iframe) with full feature parity, controls UI, keyboard
 * support, and devtools protection.
 */
export const Player = forwardRef<PlayerControls, PlayerProps>(
  function Player(props, ref) {
    const { src, type } = props;

    const playerType = determinePlayerType(src, type);

    if (playerType === "youtube") {
      return <YoutubePlayer ref={ref} {...props} />;
    }

    if (playerType === "mp4") {
      return <Mp4Player ref={ref} {...props} />;
    }

    return <HlsPlayer ref={ref} {...props} />;
  },
);

Player.displayName = "Player";
