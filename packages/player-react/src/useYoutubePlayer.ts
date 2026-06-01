import { useState, useEffect, useRef, type RefObject } from "react";

import {
  YoutubePlayer,
  type PlayerSnapshot,
  type PlayerError,
} from "@nurav/player-core";

export type UseYoutubePlayerOptions = {
  src: string;
  autoPlay?: boolean;
  startTime?: number;
  security?: { disableDevOptions?: boolean };
  /** The DOM element where the YouTube iframe will be injected.
   * Must be an element inside the rendered component tree (e.g. a div ref). */
  containerRef: RefObject<HTMLDivElement | null>;
  /**
   * The outer player wrapper element to use for requestFullscreen().
   * Should be the `.vp-player` root div so all React event handlers
   * (onClick, onPointerMove, etc.) stay inside the fullscreen layer.
   */
  fullscreenRef?: RefObject<HTMLDivElement | null>;
};

export type UseYoutubePlayerResult = {
  player: YoutubePlayer | null;
  state: PlayerSnapshot | null;
  error: PlayerError | null;
};

export function useYoutubePlayer(
  options: UseYoutubePlayerOptions,
): UseYoutubePlayerResult {
  const { src, autoPlay, startTime, security, containerRef, fullscreenRef } = options;
  const [state, setState] = useState<PlayerSnapshot | null>(null);
  const [player, setPlayer] = useState<YoutubePlayer | null>(null);
  const [error, setError] = useState<PlayerError | null>(null);
  const playerRef = useRef<YoutubePlayer | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      console.warn("[useYoutubePlayer] container not in DOM yet");
      return;
    }

    console.log("[useYoutubePlayer] Creating player for src:", src);

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
    });

    playerRef.current = instance;
    setPlayer(instance);
    setState(instance.getState());

    const initialErr = (instance as unknown as { initialError?: PlayerError })
      .initialError;
    if (initialErr) setError(initialErr);

    const unsubState = instance.subscribe((s) => {
      setState(s);
      setError(s.error);
    });
    const unsubError = instance.on("error", (e) => {
      if (!e.fatal) return;
      setError(e);
    });

    return () => {
      console.log("[useYoutubePlayer] cleanup");
      unsubState();
      unsubError();
      instance.destroy();
      playerRef.current = null;
      setPlayer(null);
      setState(null);
      setError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoPlay, startTime, containerRef.current, fullscreenRef?.current]);

  useEffect(() => {
    if (player) {
      player.setSecurityConfig(security ?? {});
    }
  }, [player, security?.disableDevOptions]);

  return { player, state, error };
}
