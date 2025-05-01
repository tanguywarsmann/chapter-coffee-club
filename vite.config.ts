
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  optimizeDeps: {
    include: ['canvas-confetti']
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        short_name: "READ",
        name: "READ — Reprends goût à la lecture, page après page",
        icons: [
          { src: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
          { src: "/icons/icon-384.png", type: "image/png", sizes: "384x384" },
          { src: "/icons/icon-512.png", type: "image/png", sizes: "512x512" }
        ],
        background_color: "#B05F2C",
        theme_color: "#E9CBA4",
        start_url: "/home",
        display: "standalone"
      },
      // copie le service worker custom dans le build
      srcDir: "public",
      filename: "sw.js",
      devOptions: {
        enabled: true,
        type: "module"
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
