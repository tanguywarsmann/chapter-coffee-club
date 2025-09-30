// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression2';

// --- stub des deps Node-only (sharp/detect-libc) + toute référence à sitemapServer côté client
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

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';
  const isNative = process.env.VREAD_NATIVE === '1' || process.env.CAPACITOR === '1';
  const usePwa = !isNative; // pas de SW en Capacitor

  return {
    // base pour Capacitor
    base: isNative ? './' : '/',

    plugins: [
      stubNodeOnly(),          // <-- en premier !
      react(),
      // PWA: garder register manuel, et désactiver l'injection du manifest (on garde /public/manifest.webmanifest)
      ...(usePwa ? [
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: null, // on appelle notre register dans pwa.ts
          manifest: false,      // ne pas injecter de <link rel="manifest"> (évite le WARNING)
        }),
      ] : []),
      // compressions
      compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
      compression({ algorithm: 'brotliCompress', exclude: [/\.(br)$/, /\.(gz)$/] }),
    ],

    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(process.cwd(), 'src') },
        { find: /^sharp(\/.*)?$/, replacement: path.resolve(process.cwd(), 'src/empty-module.ts') },
        { find: /^detect-libc(\/.*)?$/, replacement: path.resolve(process.cwd(), 'src/empty-module.ts') },
        // si tu veux forcer un stub quand PWA off :
        ...(!usePwa ? [
          { find: 'virtual:pwa-register/react', replacement: path.resolve(process.cwd(), 'src/pwa-register-stub.ts') },
          { find: 'virtual:pwa-register',        replacement: path.resolve(process.cwd(), 'src/pwa-register-stub.ts') },
        ] : []),
      ],
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'lucide-react'],
      exclude: ['sharp', 'detect-libc'],
    },

    ssr: { noExternal: ['sharp'] },

    build: {
      target: 'es2020',
      sourcemap: false,
      minify: 'terser',
      terserOptions: { compress: { drop_console: true, drop_debugger: true } },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (/(react|react-dom|scheduler)/.test(id)) return 'vendor-react';
            if (/(@supabase)/.test(id)) return 'vendor-supabase';
            if (/(radix|@radix-ui|lucide-react)/.test(id)) return 'vendor-ui';
            if (/workbox|virtual:pwa-register/.test(id)) return 'vendor-utils';
            // ne RIEN renvoyer d'autre -> plus de "vendor-image"
          },
        },
      },
    },
  };
});
