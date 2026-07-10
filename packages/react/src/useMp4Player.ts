import type { UseMp4PlayerOptions, UseMp4PlayerResult } from "./types";
import { useRef, useState, useEffect, useCallback } from "react";
import { Mp4Player, type PlayerSnapshot } from "@playerkit/core";

/**
 * useMp4Player — React hook that mounts an `Mp4Player` headless engine
 * against a managed `<video>` element ref.
 *
 * Mirrors `useHlsPlayer` in shape and behaviour so consumers can swap
 * between the two engines without changing component logic. MP4 is a
 * progressive format, so the `live` config is intentionally not exposed.
 */
export function useMp4Player(options: UseMp4PlayerOptions): UseMp4PlayerResult {
  const [state, setState] = useState<PlayerSnapshot | null>(null);
  const [player, setPlayer] = useState<Mp4Player | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Mp4Player | null>(null);

  // Store all options except src in refs so they don't
  // trigger player re-creation on every render when references change.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Only recreate the player when the stream src changes.
  // This prevents repeated authenticate() calls when the parent
  // re-renders with inline tokenFetcher functions.
  const createPlayer = useCallback(() => {
    const video = videoRef.current;

    if (!video) return null;

    const opts = optionsRef.current;

    // Destroy any existing player before creating a new one
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const instance = new Mp4Player({
      video,
      root: opts.root || rootRef.current || video,
      src: opts.src,
      autoPlay: opts.autoPlay,
      keyboard: false,
      startTime: opts.startTime,
      tokenFetcher: opts.tokenFetcher,
      tokenRefresher: opts.tokenRefresher,
      security: opts.security,
      logLevel: opts.logLevel,
    });

    playerRef.current = instance;
    setPlayer(instance);
    setState(instance.getState());

    const unsubscribeState = instance.subscribe((s) => {
      setState(s);
    });

    return () => {
      unsubscribeState();
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
      player.setSecurityConfig(options.security ?? {});
    }
  }, [player, options.security?.disableDevOptions]);

  return {
    rootRef,
    videoRef,
    player,
    state,
  };
}
