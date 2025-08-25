
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression2';

export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Activer le composant tagger seulement en développement
    ...(command === 'serve' ? [componentTagger()] : []),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: [
        'branding/vread-favicon.svg',
        'branding/vread-favicon-32.png',
        'branding/vread-favicon-16.png',
        'branding/vread-apple-touch-icon.png'
      ],
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,jpg,jpeg}'],
        maximumFileSizeToCacheInBytes: 3000000, // 3MB max par fichier
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
              },
            },
          },
        ],
      },
      manifest: {
        name: 'VREAD',
        short_name: 'VREAD',
        start_url: '/',
        display: 'standalone',
        background_color: '#B05F2C',
        theme_color: '#E9CBA4',
        icons: [
          { src: '/branding/vread-logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/branding/vread-logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$ /, /\.(gz)$/],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les gros packages
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-image': ['sharp'], // Séparer Sharp pour éviter les gros chunks
        },
      },
    },
    // Optimiser la taille du bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
      },
    },
    // Générer des chunks plus petits
    chunkSizeWarningLimit: 1000, // Avertir si chunk > 1MB
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
    ],
    exclude: ['sharp'], // Exclure Sharp du pre-bundling
  },
}));
