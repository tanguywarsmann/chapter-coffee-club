import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from "path";

const isNative = process.env.VREAD_NATIVE === '1';

export default defineConfig({
  base: isNative ? './' : '/',
  plugins: [react()],
  build: { outDir: 'dist' },
  define: { __VREAD_NATIVE__: JSON.stringify(isNative) },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});