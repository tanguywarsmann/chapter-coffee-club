
/// <reference types="vite/client" />

declare module '*.md' {
  // Pour vite-plugin-markdown avec mode ['html', 'meta']
  const html: string;
  const metadata: Record<string, any>;
  
  export { html, metadata };
}
