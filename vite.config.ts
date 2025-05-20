// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'
import { VitePWA } from 'vite-plugin-pwa'
import { compression } from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => ({
  server: { host: '::', port: 8080 },

  plugins: [
    // 1) VitePWA en mode generateSW
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },

      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
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
            urlPattern: /^https:\/\/your\.api\.domain\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-calls',
              networkTimeoutSeconds: 10
            }
          }
        ]
      },

      manifest: {
        short_name: 'READ',
        name: 'READ — Reprends goût à la lecture, page après page',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ],
        background_color: '#B05F2C',
        theme_color: '#E9CBA4',
        start_url: '/home',
        display: 'standalone'
      }
    }),

    // 2) Tes autres plugins
    react(),
    mode === 'development' && componentTagger(),
    compression({ algorithm: 'gzip',         exclude: [/\.(br|gz)$/] }),
    compression({ algorithm: 'brotliCompress', exclude: [/\.(br|gz)$/] }),
  ].filter(Boolean),

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },

  build: {
    emptyOutDir: true,
    sourcemap: mode === 'development',
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: mode !== 'development', drop_debugger: true }
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          'react-vendor':    ['react','react-dom','react-router-dom'],
          'ui-components':   ['@radix-ui/react-dialog','@radix-ui/react-popover'],
          'data-management': ['@tanstack/react-query']
        }
      }
    }
  }
}))

