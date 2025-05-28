
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'
import { VitePWA } from 'vite-plugin-pwa'
import { compression } from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => ({
  server: { host: '::', port: 8080 },

  plugins: [
    // Configuration PWA simplifiée et fonctionnelle
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'custom-sw.ts',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      devOptions: { 
        enabled: true,
        type: 'module'
      },
      
      manifest: {
        name: 'READ',
        short_name: 'READ',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#B05F2C',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
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
    chunkSizeWarningLimit: 1500,
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

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
}))
