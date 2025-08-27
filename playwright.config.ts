import { defineConfig } from '@playwright/test';

const external = process.env.PLAYWRIGHT_BASE_URL || '';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: "http://localhost:4173" },
  reporter: [['list']],
  webServer: external
    ? undefined
    : {
        command: 'npm run preview',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000
      }
});