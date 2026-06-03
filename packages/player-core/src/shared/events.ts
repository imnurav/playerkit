type Listener<TPayload> = TPayload extends void
  ? () => void
  : (payload: TPayload) => void;

export class EventEmitter<TEvents extends Record<string, unknown>> {
  private events = new Map<
    keyof TEvents,
    Array<Listener<TEvents[keyof TEvents]>>
  >();

  on<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: Listener<TEvents[TEvent]>,
  ) {
    const listeners = this.events.get(event) || [];
    listeners.push(listener as Listener<TEvents[keyof TEvents]>);

    this.events.set(event, listeners);

    return () => {
      this.off(event, listener);
    };
  }

  protected emit<TEvent extends keyof TEvents>(
    event: TEvent,
    ...payload: TEvents[TEvent] extends void ? [] : [TEvents[TEvent]]
  ) {
    const listeners = this.events.get(event) || [];

    listeners.forEach((listener) => {
      (listener as (...args: unknown[]) => void)(...payload);
    });
  }

  off<TEvent extends keyof TEvents>(
    event: TEvent,
    listener: Listener<TEvents[TEvent]>,
  ) {
    const listeners = this.events.get(event) || [];

    this.events.set(
      event,
      listeners.filter((l) => l !== listener),
    );
  }

  removeAllListeners() {
    this.events.clear();
  }
}
