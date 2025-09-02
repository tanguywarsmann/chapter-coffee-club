// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },

  // Serveur SPA avec fallback (toutes les routes renvoient index.html)
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