
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'
import { VitePWA } from 'vite-plugin-pwa'
import { compression } from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => ({
  server: { host: '::', port: 8080 },

  plugins: [
    // PWA configuration optimisée pour iOS
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/*.png', 'fonts/*'],
      devOptions: { 
        enabled: true,
        type: 'module'
      },
      
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
      },
      
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: false, // Laisser le SW gérer cela
        clientsClaim: false, // Laisser le SW gérer cela
      },

      manifest: false // Utiliser le manifest.json du dossier public
    }),

    react(),
    mode === 'development' && componentTagger(),
    compression({ algorithm: 'gzip', exclude: [/\.(br|gz)$/] }),
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
    chunkSizeWarningLimit: 1500, // Augmenté pour éviter les warnings
    terserOptions: {
      compress: { 
        drop_console: mode !== 'development', 
        drop_debugger: true,
        pure_funcs: mode !== 'development' ? ['console.log', 'console.info'] : []
      }
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          'ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
          'icons': ['lucide-react'],
          'charts': ['recharts']
        }
      }
    }
  },

  // Optimisations pour iOS
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
}))
