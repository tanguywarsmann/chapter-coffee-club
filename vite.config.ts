// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import compression from "vite-plugin-compression2";

export default defineConfig(({ command, mode }) => {
  // Astuce: mets VREAD_NATIVE=1 pour un build natif (Capacitor iOS) sans Service Worker
  const isDev = command === "serve";
  // Force native mode detection: Capacitor build ou variable explicite
  const isNative = process.env.VREAD_NATIVE === "1" || mode === "capacitor";

  return {
    // Expose aussi NEXT_PUBLIC_* si tu en as besoin côté client
    envPrefix: ["VITE_", "NEXT_PUBLIC_", "VREAD_"],

    server: {
      host: "::",
      port: 8080,
    },

    define: {
      __VREAD_BUILD__: JSON.stringify(new Date().toISOString()),
    },

    // CRITICAL: Base path pour Capacitor 
    base: isNative ? './' : '/',

    plugins: [
      react(),
      // Activer le tagger Lovable uniquement en dev
      ...(isDev ? [componentTagger()] : []),

      // PWA: **désactivée** si build natif iOS (isNative)
      ...(!isNative
        ? [
            VitePWA({
              registerType: "autoUpdate",
              devOptions: { enabled: true },
              includeAssets: [
                "branding/vread-favicon.svg",
                "branding/vread-favicon-32.png",
                "branding/vread-favicon-16.png",
                "branding/vread-apple-touch-icon.png",
              ],
              workbox: {
                clientsClaim: true,
                skipWaiting: true,
                globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,avif,jpg,jpeg}"],
                maximumFileSizeToCacheInBytes: 3_000_000,
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/api\//],
                runtimeCaching: [
                  {
                    urlPattern: ({ request }) => request.mode === "navigate",
                    handler: "NetworkFirst",
                    options: {
                      cacheName: "pages-cache",
                      networkTimeoutSeconds: 3,
                      expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 24 * 60 * 60,
                      },
                    },
                  },
                  {
                    urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|webp|avif)$/,
                    handler: "CacheFirst",
                    options: {
                      cacheName: "images-cache",
                      expiration: {
                        maxEntries: 150,
                        maxAgeSeconds: 30 * 24 * 60 * 60,
                      },
                    },
                  },
                ],
              },
              manifest: {
                name: "VREAD",
                short_name: "VREAD",
                start_url: "/",
                display: "standalone",
                background_color: "#B05F2C",
                theme_color: "#E9CBA4",
                icons: [
                  { src: "/branding/vread-logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                  { src: "/branding/vread-logo-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
                ],
              },
            }),
          ]
        : []),

      // Double compression (gzip + brotli), sans re-compresser les fichiers déjà compressés
      compression({
        algorithm: "gzip",
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
      compression({
        algorithm: "brotliCompress",
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      // cible raisonnable pour mobiles modernes
      target: "es2020",
      sourcemap: false,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Découpage utile sans modules Node
            "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"],
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-supabase": ["@supabase/supabase-js"],
            "vendor-utils": ["date-fns", "clsx", "tailwind-merge"],
          },
        },
      },
    },

    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "@supabase/supabase-js", "lucide-react"],
      // ⚠️ Ne jamais tenter de pré-bundler "sharp" côté client
      exclude: [],
    },
  };
});
