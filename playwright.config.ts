import { defineConfig, devices } from '@playwright/test';

// E2E hermético: levanta un mock del REST de Supabase y la app Next apuntada
// a ese mock, así no se toca la base real ni se crean pedidos de prueba.
const MOCK_PORT = 54321;
const APP_PORT = 3100;

const supabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${APP_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: `node e2e/mock-supabase.mjs`,
      port: MOCK_PORT,
      reuseExistingServer: !process.env.CI,
      env: { MOCK_SUPABASE_PORT: String(MOCK_PORT) },
    },
    {
      command: `next start -p ${APP_PORT}`,
      port: APP_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: supabaseEnv,
    },
  ],
});
