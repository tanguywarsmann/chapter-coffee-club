
/// <reference lib="webworker" />
export {};

declare const self: ServiceWorkerGlobalScope;

interface ServiceWorkerGlobalScope extends EventTarget {
  __WB_MANIFEST: Array<{
    url: string;
    revision: string;
  }>;
  skipWaiting(): void;
  clients: Clients;
}

interface Clients {
  claim(): void;
}

interface ExtendableMessageEvent extends ExtendableEvent {
  data?: any;
}
