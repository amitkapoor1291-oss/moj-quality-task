import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env';

/**
 * Two projects keep the layers separate and independently runnable:
 *   npm run test:api   -> no browser is launched, fast feedback
 *   npm run test:ui    -> Chromium
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: config.petstoreBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: config.orangeHrmBaseUrl },
    },
  ],
});
