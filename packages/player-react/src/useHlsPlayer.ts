import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type RefObject,
} from "react";

import {
  Player,
  type TokenFetcher,
  type PlayerSnapshot,
  type PlayerError,
  type CreatePlayerOptions,
} from "@nurav/player-core";

export type UseHlsPlayerOptions = Omit<
  CreatePlayerOptions,
  "video" | "root"
> & {
  root?: HTMLElement | null;
  tokenFetcher?: TokenFetcher;
};

export type UseHlsPlayerResult = {
  player: Player | null;
  state: PlayerSnapshot | null;
  error: PlayerError | null;
  rootRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export function useHlsPlayer(options: UseHlsPlayerOptions): UseHlsPlayerResult {
  const [state, setState] = useState<PlayerSnapshot | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<PlayerError | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);

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

    const instance = new Player({
      video,
      root: opts.root || rootRef.current || video,
      src: opts.src,
      autoPlay: opts.autoPlay,
      keyboard: false,
      startTime: opts.startTime,
      tokenFetcher: opts.tokenFetcher,
      live: opts.live,
      security: opts.security,
    });

    playerRef.current = instance;
    setPlayer(instance);
    setState(instance.getState());

    // Check if a fatal error was already captured during construction
    // (hls.js errors can fire synchronously before React subscribes)
    const initialErr = (instance as unknown as { initialError?: PlayerError })
      .initialError;
    setError(initialErr ?? null);

    const unsubscribeState = instance.subscribe((s) => {
      setState(s);
      // Sync error from state — this ensures retry() clearing works
      setError(s.error);
    });
    const unsubscribeError = instance.on("error", (e) => {
      // Non-fatal errors must not overwrite a current fatal error
      if (!e.fatal) return;
      setError(e);
    });

    return () => {
      unsubscribeState();
      unsubscribeError();
      instance.destroy();
      playerRef.current = null;
      setPlayer(null);
      setState(null);
      setError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only recreate the player when the stream src changes
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
    error,
  };
}
