
/// <reference types="vite/client" />

declare module '*.md' {
  const attributes: { [key: string]: any };
  const metadata: {
    title: string;
    date: string;
    [key: string]: any;
  };
  const html: string;
  const default: string;
  export { attributes, metadata, html };
  export default default;
}
