import type { UseYoutubePlayerOptions, UseYoutubePlayerResult } from "./types";
import { YoutubePlayer, logger } from "@playerkit/core";
import { useState, useEffect, useRef } from "react";

export function useYoutubePlayer(
  options: UseYoutubePlayerOptions,
): UseYoutubePlayerResult {
  const {
    src,
    autoPlay,
    startTime,
    security,
    containerRef,
    fullscreenRef,
    logLevel,
    live,
  } = options;
  const [state, setState] = useState<
    import("@playerkit/core").PlayerSnapshot | null
  >(null);
  const [player, setPlayer] = useState<YoutubePlayer | null>(null);
  const playerRef = useRef<YoutubePlayer | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      logger.warn("[useYoutubePlayer] container not in DOM yet");
      return;
    }

    logger.debug("[useYoutubePlayer] Creating player for src:", src);

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const instance = new YoutubePlayer({
      video: document.createElement("video"),
      root: el,
      fullscreenElement: fullscreenRef?.current ?? undefined,
      src,
      autoPlay,
      startTime,
      security,
      logLevel,
      live,
    });
    logger.debug("[useYoutubePlayer] YoutubePlayer instance created", instance);

    playerRef.current = instance;
    setPlayer(instance);
    setState(instance.getState());

    const unsubState = instance.subscribe((s) => {
      setState(s);
    });

    return () => {
      logger.debug("[useYoutubePlayer] cleanup");
      unsubState();
      instance.destroy();
      playerRef.current = null;
      setPlayer(null);
      setState(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    src,
    autoPlay,
    startTime,
    containerRef.current,
    fullscreenRef?.current,
    logLevel,
    live,
  ]);

  useEffect(() => {
    if (player) {
      player.setSecurityConfig(security ?? {});
    }
  }, [player, security?.disableDevOptions]);

  return { player, state };
}
