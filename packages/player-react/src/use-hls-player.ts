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
} from "@varun/player-core";

export type UseHlsPlayerOptions = Omit<
  CreatePlayerOptions,
  "video" | "root"
> & {
  root?: HTMLElement | null;
  /** Token fetcher for authenticated streams */
  tokenFetcher?: TokenFetcher;
  /** Seconds threshold to consider "at live edge" (default: 3) */
  liveSyncDuration?: number;
  /** Enable low-latency HLS mode */
  lowLatency?: boolean;
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

  const createPlayer = useCallback(() => {
    const video = videoRef.current;

    if (!video) return null;

    const instance = new Player({
      video,
      root: options.root || rootRef.current || video,
      src: options.src,
      autoPlay: options.autoPlay,
      keyboard: options.keyboard,
      startTime: options.startTime,
      tokenFetcher: options.tokenFetcher,
      liveSyncDuration: options.liveSyncDuration,
      lowLatency: options.lowLatency,
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
  }, [
    options.src,
    options.root,
    options.autoPlay,
    options.keyboard,
    options.startTime,
    options.lowLatency,
    options.tokenFetcher,
    options.liveSyncDuration,
  ]);

  useEffect(() => {
    return createPlayer() || undefined;
  }, [createPlayer]);

  return {
    rootRef,
    videoRef,
    player,
    state,
    error,
  };
}
