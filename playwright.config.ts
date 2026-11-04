import { defineConfig } from '@playwright/test';

// Freebuff owns the preview process, so this suite targets an already-running
// origin instead of starting another dev server. Override it for production.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'hero-film.spec.ts',
  fullyParallel: false,
  retries: 0,
  timeout: 45_000,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    headless: true,
    reducedMotion: 'no-preference',
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    }
  }
});
