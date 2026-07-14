import type { UseYoutubePlayerOptions, UseYoutubePlayerResult } from "./types";
import { YoutubePlayer, logger } from "@playerkit/core";
import { useState, useEffect, useRef, useCallback } from "react";

export function useYoutubePlayer(
  options: UseYoutubePlayerOptions,
): UseYoutubePlayerResult {
  const { security } = options;
  const [state, setState] = useState<
    import("@playerkit/core").PlayerSnapshot | null
  >(null);
  const [player, setPlayer] = useState<YoutubePlayer | null>(null);
  const playerRef = useRef<YoutubePlayer | null>(null);

  // Store all options except src in refs so they don't
  // trigger player re-creation on every render when references change.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const createPlayer = useCallback(() => {
    const opts = optionsRef.current;
    const el = opts.containerRef.current;

    if (!el) {
      logger.warn("[useYoutubePlayer] container not in DOM yet");
      return;
    }

    logger.debug("[useYoutubePlayer] Creating player for src:", opts.src);

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const instance = new YoutubePlayer({
      video: document.createElement("video"),
      root: el,
      fullscreenElement: opts.fullscreenRef?.current ?? undefined,
      src: opts.src,
      autoPlay: opts.autoPlay,
      startTime: opts.startTime,
      security: opts.security,
      logLevel: opts.logLevel,
      live: opts.live,
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
    // Recreate the player when the stream src changes
    options.src,
  ]);

  useEffect(() => {
    return createPlayer() || undefined;
  }, [createPlayer]);

  useEffect(() => {
    if (player) {
      player.setSecurityConfig(security ?? {});
    }
  }, [player, security?.disableDevOptions]);

  return { player, state };
}
