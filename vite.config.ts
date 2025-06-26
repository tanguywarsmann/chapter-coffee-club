// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'
import { VitePWA } from 'vite-plugin-pwa'
import { compression } from 'vite-plugin-compression2'
import markdown from 'vite-plugin-markdown'

export default defineConfig(({ mode }) => ({
  server: { 
    host: '::', 
    port: 8080,
    // Configuration pour désindexer l'admin en développement
    headers: {
      'X-Robots-Tag': 'noindex'
    }
  },

  plugins: [
    // Plugin Markdown pour parser les fichiers .md
    markdown({ mode: ['html', 'toc', 'react'] }),

    // PWA avec stratégie de mise à jour proactive
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/*.png', 'fonts/*'],
      devOptions: { enabled: true },

      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        skipWaiting: true,
        clientsClaim: true,
        // Exclure les fichiers d'administration du cache
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        globIgnores: ['**/admin/**'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/xjumsrjuyzvsixvfwoiz\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-calls',
              networkTimeoutSeconds: 10
            }
          }
        ]
      },

      manifest: false // Use the manifest.json from the public folder
    }),

    // Other plugins
    react(),
    mode === 'development' && componentTagger(),
    compression({ algorithm: 'gzip', exclude: [/\.(br|gz)$/] }),
    compression({ algorithm: 'brotliCompress', exclude: [/\.(br|gz)$/] }),
  ].filter(Boolean),

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },

  // Configuration de test pour Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },

  build: {
    emptyOutDir: true,
    sourcemap: mode === 'development',
    target: 'esnext',
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: { drop_console: mode !== 'development', drop_debugger: true }
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
          lucide: ["lucide-react"],
          charts: ["recharts"],
          'react-vendor': ['react','react-dom','react-router-dom'],
          'ui-components': ['@radix-ui/react-dialog','@radix-ui/react-popover']
        }
      }
    }
  }
}))
