import type { PlayerSnapshot, PlayerState, PlayerStateListener, Unsubscribe } from "../types/player.types";

export function createInitialPlayerState(src: string): PlayerState {
  return {
    src,
    isReady: false,
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    selectedQuality: "auto",
    activeQuality: null,
    qualities: [],
    buffered: [],
    bufferedEnd: 0,
    bufferedPercent: 0,
  };
}

export class PlayerStore {
  private state: PlayerState;
  private listeners = new Set<PlayerStateListener>();

  constructor(initialState: PlayerState) {
    this.state = initialState;
  }

  getState(): PlayerSnapshot {
    return { ...this.state, qualities: [...this.state.qualities] };
  }

  setState(update: Partial<PlayerState>) {
    this.state = { ...this.state, ...update };
    this.notify();
  }

  subscribe(listener: PlayerStateListener): Unsubscribe {
    this.listeners.add(listener);
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  destroy() {
    this.listeners.clear();
  }

  private notify() {
    const snapshot = this.getState();

    this.listeners.forEach((listener) => {
      listener(snapshot);
    });
  }
}
