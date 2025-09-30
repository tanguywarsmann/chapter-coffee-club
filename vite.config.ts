// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import compression from "vite-plugin-compression2";

export default defineConfig(({ command, mode }) => {
  // Astuce: mets VREAD_NATIVE=1 pour un build natif (Capacitor iOS) sans Service Worker
  const isDev = command === "serve";
  // Force native mode detection: Capacitor build ou variable explicite
  const isNative = process.env.VREAD_NATIVE === "1" || mode === "capacitor";
const usePwa = !isNative && process.env.VITE_USE_PWA === "1";

  return {
    // Expose aussi NEXT_PUBLIC_* si tu en as besoin côté client
    envPrefix: ["VITE_", "NEXT_PUBLIC_", "VREAD_"],

    server: {
      host: "::",
      port: 8080,
    },

   define: {
  __VREAD_BUILD__: JSON.stringify(new Date().toISOString()),
  __VREAD_NATIVE__: JSON.stringify(isNative),
},

    // CRITICAL: Base path pour Capacitor 
    base: isNative ? './' : '/',

    plugins: [
      react(),
      // Activer le tagger Lovable uniquement en dev
      ...(isDev ? [componentTagger()] : []),

     // PWA: uniquement si usePwa === true (jamais en natif, jamais par défaut)
...(usePwa
  ? [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: 'auto',
        manifest: {
          name: 'VREAD',
          short_name: 'VREAD',
          start_url: '/',
          display: 'standalone',
          background_color: '#B05F2C',
          theme_color: '#E9CBA4',
          icons: [
            { src: '/branding/vread-logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/branding/vread-logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
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
    "@": path.resolve(process.cwd(), "./src"),
    // Stub sharp pour éviter le bundling côté client
    "sharp": path.resolve(process.cwd(), "src/empty-module.ts"),
    // Quand PWA OFF, remplace le module virtuel par un stub no-op
    ...(!usePwa
      ? {
          "virtual:pwa-register/react": path.resolve(process.cwd(), "src/pwa-register-stub.ts"),
          "virtual:pwa-register": path.resolve(process.cwd(), "src/pwa-register-stub.ts"),
        }
      : {}),
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
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (/(react|react-dom|scheduler)/.test(id)) return 'vendor-react';
            if (/(@supabase)/.test(id)) return 'vendor-supabase';
            if (/(radix|@radix-ui|lucide-react)/.test(id)) return 'vendor-ui';
            if (/workbox|virtual:pwa-register/.test(id)) return 'vendor-utils';
            // ne pas créer de vendor-image
          },
        },
      },
    },

    ssr: {
      noExternal: ['sharp'],
    },

    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "@supabase/supabase-js", "lucide-react"],
      // ⚠️ Ne jamais tenter de pré-bundler "sharp" côté client
      exclude: [],
    },
  };
});
