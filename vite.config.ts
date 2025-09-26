import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { componentTagger } from "lovable-tagger";

const isNative = process.env.VREAD_NATIVE === '1';
// Par défaut, on N'UTILISE PAS la PWA (utile pour Lovable et build natif)
const usePwa = process.env.VITE_USE_PWA === '1';

export default defineConfig(({ mode }) => ({
  base: isNative ? './' : '/',
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  build: { outDir: 'dist' },
  define: { __VREAD_NATIVE__: JSON.stringify(isNative) },
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...(!usePwa ? {
        'virtual:pwa-register/react': path.resolve(__dirname, './src/pwa-register-stub.ts'),
        'virtual:pwa-register': path.resolve(__dirname, './src/pwa-register-stub.ts'),
      } : {}),
    },
  },
}));