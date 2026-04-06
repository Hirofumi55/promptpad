import { defineConfig, devices } from '@playwright/test';

const env =
  (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env ?? {};

const baseURL = env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const useRemoteBaseUrl = Boolean(env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 7_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'ja-JP',
    colorScheme: 'dark',
    permissions: ['clipboard-read', 'clipboard-write'],
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: useRemoteBaseUrl
    ? undefined
    : {
        command: 'pnpm preview --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        browserName: 'chromium',
        ...devices['iPhone 13'],
      },
    },
  ],
});
