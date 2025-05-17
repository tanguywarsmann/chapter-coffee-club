
/// <reference lib="webworker" />

interface ExtendableMessageEvent extends ExtendableEvent {
  readonly data: any;
  readonly lastEventId: string;
  readonly origin: string;
  readonly ports: ReadonlyArray<MessagePort>;
  readonly source: Client | ServiceWorker | MessagePort | null;
}

interface FetchEvent extends ExtendableEvent {
  readonly clientId: string;
  readonly request: Request;
  readonly resultingClientId: string;
  respondWith(r: Response | PromiseLike<Response>): void;
}
