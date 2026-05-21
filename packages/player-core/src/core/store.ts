import type {
  PlayerState,
  Unsubscribe,
  PlayerSnapshot,
  PlayerStateListener,
} from "../types/player.types";

export function createInitialPlayerState(src: string): PlayerState {
  return {
    src,
    volume: 1,
    dvr: false,
    duration: 0,
    buffered: [],
    qualities: [],
    isLive: false,
    isReady: false,
    isMuted: false,
    currentTime: 0,
    bufferedEnd: 0,
    liveLatency: 0,
    seekableEnd: 0,
    playbackRate: 1,
    isPlaying: false,
    seekableStart: 0,
    previousVolume: 1,
    isStretched: false,
    isBuffering: false,
    bufferedPercent: 0,
    isFullscreen: false,
    activeQuality: null,
    // Live stream state
    isAtLiveEdge: false,
    selectedQuality: "auto",
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
