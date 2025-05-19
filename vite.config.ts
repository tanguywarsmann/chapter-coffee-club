
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
    react(),
    mode === 'development' && componentTagger(),
    compression({ algorithm: 'gzip', exclude: [/\.(br|gz)$/] }),
    compression({ algorithm: 'brotliCompress', exclude: [/\.(br|gz)$/] }),

    VitePWA({
      strategies: 'injectManifest',
      injectRegister: null,    // plus de registerSW.js
      workbox: undefined,      // désactive generateSW
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },

      injectManifest: {
        swSrc:  'src/sw.ts',    // ← chemin complet vers ton SW source
        swDest: 'sw.js',        // ← nom du service-worker généré dans dist/
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },

      manifest: {
        short_name: 'READ',
        name:       'READ — Reprends goût à la lecture, page après page',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ],
        background_color: '#B05F2C',
        theme_color:      '#E9CBA4',
        start_url:        '/home',
        display:          'standalone'
      }
    })
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },

  build: {
    emptyOutDir: true,
    sourcemap : mode === 'development',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          'react-vendor'   : ['react', 'react-dom', 'react-router-dom'],
          'ui-components'  : ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
          'data-management': ['@tanstack/react-query']
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode !== 'development',
        drop_debugger: true
      }
    }
  }
}))
