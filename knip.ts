import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: [
		"src/main.tsx",
		"index.html",
		"vite.config.ts",
		"capacitor.config.ts",
		"tailwind.config.ts",
		"postcss.config.js",
		"eslint.config.js",
		"playwright.config.ts",
		"vitest.setup.ts",
		"scripts/**/*.{ts,js,mjs}",
		"api/**/*.{ts,js}",
		"supabase/functions/**/*.{ts,js}",
		"src/pwa.ts",
		"src/sw.ts",
	],
	project: [
		"src/**/*.{ts,tsx}",
		"scripts/**/*.{ts,js,mjs}",
		"api/**/*.{ts,js}",
		"supabase/functions/**/*.{ts,js}",
	],
	ignore: [
		"**/*.d.ts",
		"src/vite-env.d.ts",
		"src/sw.d.ts",
		"supabase/migrations/*.sql",
		"codemod/**/*",
	],
	ignoreDependencies: [
		// Often used in scripts or config but not directly imported in code
		"autoprefixer",
		"postcss",
		"tailwindcss",
		"terser",
		"workbox-precaching",
		"workbox-window",
		"@types/*",
		"sharp", // handled via stub in vite config
		"detect-libc",
	],
};

export default config;
