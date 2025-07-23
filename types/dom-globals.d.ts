/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Explicit DOM type declarations for TypeScript
declare global {
  interface Window {
    [key: string]: any;
  }
  
  interface Document {
    [key: string]: any;
  }
  
  var window: Window & typeof globalThis;
  var document: Document;
  var Image: {
    new(): HTMLImageElement;
    prototype: HTMLImageElement;
  };
  var confirm: (message?: string) => boolean;
  var PerformanceNavigationTiming: {
    new(): PerformanceNavigationTiming;
    prototype: PerformanceNavigationTiming;
  };
}

// Event target extensions for form handling
declare module "react" {
  interface FormEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
  
  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
}

export {};