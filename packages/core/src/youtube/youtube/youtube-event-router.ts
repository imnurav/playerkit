import { YouTubePlayerState } from "../../types/youtube.types";

/**
 * Responsible for subscribing to YouTube iframe player events
 * and routing them to the manager/controller callbacks.
 */
export class YoutubeEventRouter {
  constructor(
    private readonly callbacks: {
      onReady: () => void;
      onStateChange: (state: YouTubePlayerState) => void;
      onError: (errorCode: number) => void;
    },
  ) {}

  /**
   * Constructs the events configuration object required by the YouTube Player constructor.
   *
   * @param resolve Promise resolver to return the active player instance.
   * @param onReadyTrigger Callback containing internal ready logic.
   */
  routeEvents(
    resolve: (player: any) => void,
    onReadyTrigger: (targetPlayer: any) => void,
  ): Record<string, any> {
    return {
      onReady: (event: any) => {
        onReadyTrigger(event.target);
        this.callbacks.onReady();
        resolve(event.target);
      },
      onStateChange: (event: any) => {
        this.callbacks.onStateChange(event.data as YouTubePlayerState);
      },
      onError: (event: any) => {
        resolve(null);
        this.callbacks.onError(event.data);
      },
    };
  }
}
