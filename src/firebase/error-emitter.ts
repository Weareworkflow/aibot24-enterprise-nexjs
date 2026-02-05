
'use client';

/**
 * Implementación personalizada de un emisor de eventos para evitar
 * dependencias de Node.js (events) en el navegador.
 */
type Listener = (...args: any[]) => void;

class CustomEventEmitter {
  private events: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: Listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

export const errorEmitter = new CustomEventEmitter();
