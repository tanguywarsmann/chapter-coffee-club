import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from "path";

const isNative = process.env.VREAD_NATIVE === '1';

export default defineConfig({
  base: isNative ? './' : '/',
  plugins: [react()],
  build: { outDir: 'dist' },
  define: { __VREAD_NATIVE__: JSON.stringify(isNative) },
  server: {
    port: 8080
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...(isNative ? {
        'virtual:pwa-register/react': path.resolve(__dirname, './src/pwa-register-stub.ts'),
        'virtual:pwa-register': path.resolve(__dirname, './src/pwa-register-stub.ts'),
      } : {}),
    },
  },
});