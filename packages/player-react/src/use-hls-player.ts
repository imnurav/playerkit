import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import {
  Player,
  type CreatePlayerOptions,
  type PlayerSnapshot,
} from "@varun/player-core";

export type UseHlsPlayerOptions = Omit<
  CreatePlayerOptions,
  "video" | "root"
> & {
  root?: HTMLElement | null;
};

export type UseHlsPlayerResult = {
  rootRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  player: Player | null;
  state: PlayerSnapshot | null;
};

export function useHlsPlayer(options: UseHlsPlayerOptions): UseHlsPlayerResult {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [state, setState] = useState<PlayerSnapshot | null>(null);

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
    });

    playerRef.current = instance;
    setPlayer(instance);
    setState(instance.getState());

    const unsubscribe = instance.subscribe(setState);

    return () => {
      unsubscribe();
      instance.destroy();
      playerRef.current = null;
      setPlayer(null);
      setState(null);
    };
  }, [
    options.autoPlay,
    options.keyboard,
    options.root,
    options.src,
    options.startTime,
  ]);

  useEffect(() => {
    return createPlayer() || undefined;
  }, [createPlayer]);

  return {
    rootRef,
    videoRef,
    player,
    state,
  };
}
