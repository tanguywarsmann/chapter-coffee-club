
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { compression } from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  optimizeDeps: {
    include: ['canvas-confetti'],
    exclude: ['@tanstack/react-query-devtools']
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Implement both Brotli and Gzip compression for assets
    compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
    compression({ algorithm: 'brotliCompress', exclude: [/\.(br)$/, /\.(gz)$/] }),
    VitePWA({
      registerType: 'autoUpdate',
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
      strategies: 'injectManifest',
      injectRegister: null,
      workbox: undefined, // empêche le fallback generateSW
      devOptions: {
        enabled: true,
        type: "module"
      },
      injectManifest: {
        swSrc: 'src/sw.ts', // Source du service worker
        swDest: 'sw.js', // Destination directement dans dist/
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: true,
    sourcemap: mode === 'development',
    cssCodeSplit: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // S'assurer que le seul point d'entrée est index.html
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
          'data-management': ['@tanstack/react-query'],
        },
      },
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode !== 'development',
        drop_debugger: true,
      },
    },
  },
}));
