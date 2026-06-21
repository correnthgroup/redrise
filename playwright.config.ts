import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    actionTimeout: 30000,
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
      name: 'auth-session',
      testMatch: /smoke-auth\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'auth-public',
      testMatch: /smoke-unauth\.spec\.ts/,
    },
    {
      name: 'navigation',
      testMatch: /navigation\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'dashboard',
      testMatch: /dashboard\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'flow',
      testMatch: /flow\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'tasks',
      testMatch: /tasks\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'agents',
      testMatch: /agents\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: { storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'analytics',
      testMatch: /analytics\.spec\.ts/,
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
    {
      name: 'settings',
      testMatch: /settings\.spec\.ts/,
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
