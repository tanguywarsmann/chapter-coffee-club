
export const isInIframe = () => typeof window !== "undefined" && window.self !== window.top;
export const isPreview = () => typeof window !== "undefined" && window.location.hostname.includes("lovable.app");
export const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
