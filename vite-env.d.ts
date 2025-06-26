
/// <reference types="vite/client" />

declare module '*.md' {
  // Pour vite-plugin-markdown
  const attributes: Record<string, any>;
  const html: string;
  
  export { attributes, html };
}
