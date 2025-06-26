
/// <reference types="vite/client" />

declare module '*.md' {
  import { ComponentType } from 'react';
  
  // Pour vite-plugin-markdown
  const attributes: Record<string, any>;
  const html: string;
  const toc: Array<{ anchor: string; level: number; text: string }>;
  const ReactComponent: ComponentType;
  
  export { attributes, html, toc, ReactComponent };
}
