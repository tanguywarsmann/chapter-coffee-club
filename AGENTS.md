# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the React + TypeScript app (`main.tsx`, `App.tsx`), with UI in `components/`, routes in `pages/`, auth/state in `contexts/`, data fetching in `services/` and `integrations/` (Supabase client), shared helpers in `lib/` and `utils/`, and localization in `i18n/`.
- `api/` provides Vercel functions for sitemaps (`sitemap.xml.ts`, `news-sitemap.xml.ts`) that rely on `SITEMAP_SUPABASE_URL/KEY`.
- `content/` stores Markdown-driven content; `assets/` and `public/` hold static files; `supabase/functions/` contains Deno edge functions and scripts rely on Supabase keys; `scripts/` bundles tooling (e.g., brand guard, seeding); `tests/` contains Playwright specs plus Vitest specs under `src/**/__tests__`.
- Build artifacts land in `dist/`; avoid manual edits there.

## Build, Test, and Development Commands
- Install: `npm install` (Node 20+, npm 10+). Local dev: `npm run dev`.
- Production build: `npm run build` (use `npm run build:dev` for a debug bundle); preview built assets: `npm run preview`. Clean and rebuild: `npm run clean:build`.
- Linting: `npm run lint` (enforces React hooks rules and blocks deprecated Tailwind typography utilities).
- Unit/component tests: `npx vitest run` (setup in `vitest.setup.ts`). E2E: `npm run prepare:e2e` once, then `npm run test:e2e`; for built bundles, `npm run build && npm run preview:e2e`.
- SEO/brand monitor: `BASE_URL=<https://example.com> ./scripts/brand-guard.sh`.

## Coding Style & Naming Conventions
- Use functional React components in PascalCase; hooks start with `use`; utilities/constants in camelCase/SCREAMING_SNAKE when global.
- Two-space indentation; prefer the `@/` path alias over deep relatives; group imports (libs → app modules → styles).
- Tailwind: favor design tokens (`text-h1`, `text-body`, etc.); `text-[0-9]xl` and `tracking-wide*` are disallowed by ESLint. Keep class lists ordered for readability.
- Minimize `console` usage (only `warn`/`error` are allowed); centralize shared logic in `lib/` or `services/` instead of duplicating in components.
- React effects discipline (see https://react.dev/learn/you-might-not-need-an-effect): derive UI from props/state instead of setting state in `useEffect`; prefer event handlers for imperatives; compute derived data inline or via memo if expensive; use effects only for syncing with external systems (storage, analytics, timers, subscriptions) and always clean up.

## Testing Guidelines
- Place unit and component specs alongside code in `src/**/__tests__/**/*.(test|spec).ts[x]`; use Testing Library helpers and the DOM matchers registered in `vitest.setup.ts`.
- Playwright specs live in `tests/**/*.spec.ts`; smoke/P0 coverage is under `tests/p0-audit` and `tests/e2e/*.spec.ts`. Keep tests deterministic (seed data via scripts, avoid timeouts where possible).
- When adding features, include at least one unit or E2E check covering the primary user path; document any gaps in the PR.

## Commit & Pull Request Guidelines
- Prefer concise, imperative commit subjects using `type: summary` seen in history (`feature: ...`, `fix: ...`, `chore: ...`). Keep to ~72 chars and bundle related files only.
- PRs should list scope, linked issue/task, manual checks performed (`npm run lint`, `npx vitest`, `npm run test:e2e`), and note any env/config changes (Supabase keys, PWA headers, Capacitor). Include before/after screenshots for UI work.
- Keep PRs tight; update relevant docs/content when behavior or APIs change.

## Security & Configuration Tips
- Do not commit secrets. Required env vars include `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and sitemap keys (`SITEMAP_SUPABASE_URL/KEY`); scripts in `supabase/functions/` also expect `SUPABASE_URL` and service keys.
- `vercel.json` rewrites route API/sitemaps—verify they remain intact after routing changes. For native builds, run `npm run sync:ios` after dependency or asset updates and remember PWA service worker is disabled on Capacitor.
