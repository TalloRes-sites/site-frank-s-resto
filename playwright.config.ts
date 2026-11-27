import { defineConfig, devices } from '@playwright/test';

// Smoke tests against the built site (`npm run build` first). External requests are blocked in the
// tests, so they do not depend on the TalloRes widget or OpenStreetMap being reachable.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL: 'http://localhost:4321', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: { command: 'npx astro preview --port 4321', url: 'http://localhost:4321/nl/', reuseExistingServer: !process.env.CI },
});
