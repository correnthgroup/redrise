import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  retries: 1,
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'smoke-auth',
      testMatch: /smoke-auth\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'smoke-unauth',
      testMatch: /smoke-unauth\.spec\.ts/,
    },
    {
      name: 'navigation',
      testMatch: /navigation\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'workspaces',
      testMatch: /workspaces\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
      fullyParallel: false,
    },
  ],
  webServer: {
    command: 'corepack yarn dev --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  outputDir: 'tests/test-results',
})
