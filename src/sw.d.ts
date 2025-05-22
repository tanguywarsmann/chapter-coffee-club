
/// <reference lib="webworker" />
export {};

declare global {
  interface ServiceWorkerGlobalScope extends EventTarget {
    __WB_MANIFEST: Array<{
      url: string;
      revision: string;
    }>;
  }
}
