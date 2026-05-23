import type { GameEvents } from "@/types/game";

type Handler<T> = (payload: T) => void;
type ListenerMap = { [K in keyof GameEvents]?: Set<Handler<GameEvents[K]>> };

class TypedEventBus {
  private listeners: ListenerMap = {};

  on<K extends keyof GameEvents>(event: K, handler: Handler<GameEvents[K]>) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set<Handler<GameEvents[K]>>() as ListenerMap[K];
    }

    this.listeners[event]!.add(handler);

    return () => this.off(event, handler);
  }

  off<K extends keyof GameEvents>(event: K, handler: Handler<GameEvents[K]>) {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]) {
    this.listeners[event]?.forEach((handler) => handler(payload));
  }
}

export const EventBus = new TypedEventBus();
