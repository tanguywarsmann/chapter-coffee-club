// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression2';
import { componentTagger } from 'lovable-tagger';

// --- Stub universel : neutralise sharp/detect-libc (Node-only) et toute réf client à sitemapServer ---
function stubNodeOnly() {
  const wantsStubSource = (id: string) =>
    /^sharp(?:\/.*)?$/.test(id) ||
    /^detect-libc(?:\/.*)?$/.test(id) ||
    /(?:^|\/)sitemapServer(?:\.|\/)/.test(id); // ex: src/utils/sitemapServer.ts

  const wantsStubAbsolute = (id: string) =>
    /[\\/]node_modules[\\/]sharp[\\/]/.test(id) ||
    /[\\/]node_modules[\\/]detect-libc[\\/]/.test(id) ||
    /(?:^|\/)src[\\/].*sitemapServer(?:\.|[\\/])/.test(id);

  return {
    name: 'stub-node-only',
    resolveId(source: string) {
      if (wantsStubSource(source)) return '\0stub:empty';
      return null;
    },
    load(id: string) {
      if (id === '\0stub:empty' || wantsStubAbsolute(id)) {
        return 'export default {}';
      }
      return null;
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const isNative =
    process.env.VREAD_NATIVE === '1' ||
    process.env.CAPACITOR === '1' ||
    mode === 'capacitor';
  const usePwa =
    !isNative &&
    (process.env.VITE_USE_PWA === '1' || process.env.VITE_USE_PWA === 'true');

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'VREAD_'],

    define: {
      __VREAD_BUILD__: JSON.stringify(new Date().toISOString()),
      __VREAD_NATIVE__: JSON.stringify(isNative),
    },

    // Chemin relatif pour Capacitor (WKWebView), absolu pour web
    base: isNative ? './' : '/',

    server: {
      host: '::',
      port: 8080,
    },

    plugins: [
      // IMPORTANT: en premier pour empêcher la résolution de sharp/detect-libc/sitemapServer
      stubNodeOnly(),
      react(),
      ...(isDev ? [componentTagger()] : []),

      // PWA côté Web uniquement (jamais en natif)
      ...(usePwa
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              injectRegister: null, // on enregistre via src/pwa.ts
              // Laisse le manifest statique dans public/manifest.webmanifest
              manifest: false, // évite l'injection et fait taire le WARNING "head/body not found"
            }),
          ]
        : []),

      // Gzip + Brotli (sans re-compresser .gz/.br)
      compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
      compression({ algorithm: 'brotliCompress', exclude: [/\.(br)$/, /\.(gz)$/] }),
    ],

    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(process.cwd(), 'src') },
        { find: /^sharp(\/.*)?$/, replacement: path.resolve(process.cwd(), 'src/empty-module.ts') },
        { find: /^detect-libc(\/.*)?$/, replacement: path.resolve(process.cwd(), 'src/empty-module.ts') },
        // Sécurité: si un import "sitemapServer" traîne côté client, on le stub automatiquement
        { find: /sitemapServer$/, replacement: path.resolve(process.cwd(), 'src/empty-module.ts') },
        // Quand la PWA est OFF, on mappe les modules virtuels vers un stub no-op
        ...(!usePwa
          ? [
              { find: 'virtual:pwa-register/react', replacement: path.resolve(process.cwd(), 'src/pwa-register-stub.ts') },
              { find: 'virtual:pwa-register',        replacement: path.resolve(process.cwd(), 'src/pwa-register-stub.ts') },
            ]
          : []),
      ],
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'lucide-react'],
      exclude: ['sharp', 'detect-libc'],
    },

    ssr: {
      noExternal: ['sharp'],
    },

    build: {
      target: 'es2020',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true },
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
            // ne RIEN renvoyer d’autre -> évite 'vendor-image'
          },
        },
      },
    },
  };
});
