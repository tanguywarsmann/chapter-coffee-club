import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Si Lovable fournit ce plugin, importe-le. Sinon, garde un no-op.
let componentTagger: any = () => ({ name: 'noop-component-tagger' });
try {
  // adapte l'import si ton plugin s'appelle autrement
  // ex: import componentTagger from 'lovable/plugin'
  // @ts-ignore
  componentTagger = (await import('lovable/plugin')).default;
} catch {}

export default defineConfig(({ mode }) => {
  const isNative = process.env.VREAD_NATIVE === '1';
  // Par défaut PWA désactivée (utile pour builds natifs/Lovable)
  const usePwa = process.env.VITE_USE_PWA === '1';

  return {
    base: isNative ? './' : '/',
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    build: { outDir: 'dist' },
    define: { __VREAD_NATIVE__: JSON.stringify(isNative) },
    server: {
      host: '::',
      port: 8080, // pas nécessaire pour build, inoffensif
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
        // mappe le module virtuel PWA vers notre stub quand PWA désactivée
        ...(!usePwa
          ? {
              'virtual:pwa-register/react': path.resolve(process.cwd(), 'src/pwa-register-stub.ts'),
              'virtual:pwa-register': path.resolve(process.cwd(), 'src/pwa-register-stub.ts'),
            }
          : {}),
      },
    },
  };
});
