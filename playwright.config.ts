cat > playwright.config.ts <<'TS'
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },

  // Lance un serveur statique AVEC fallback SPA pour toutes les routes
  webServer: {
    command: 'npm run preview:e2e',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
TS
git add playwright.config.ts && git commit -m "test: use SPA server + baseURL for e2e"
