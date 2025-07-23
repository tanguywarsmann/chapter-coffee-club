// Fallback pour build SSR où `window|document` sont absents
declare const window: Window & typeof globalThis;
declare const document: Document;