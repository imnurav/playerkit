type Listener = (...args: any[]) => void;

export class EventEmitter {
  private events = new Map<string, Listener[]>();

  on(event: string, listener: Listener) {
    const listeners = this.events.get(event) || [];
    listeners.push(listener);

    this.events.set(event, listeners);
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event) || [];

    listeners.forEach((listener) => {
      listener(...args);
    });
  }

  off(event: string, listener: Listener) {
    const listeners = this.events.get(event) || [];

    this.events.set(
      event,
      listeners.filter((l) => l !== listener),
    );
  }
}
