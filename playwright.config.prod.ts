import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for production build testing
 * 
 * Usage:
 * 1. Build the app: npm run build
 * 2. Start preview server: npm run preview (runs on port 4173)
 * 3. Run tests: npx playwright test --config=playwright.config.prod.ts
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  outputDir: '',
  
  use: {
    baseURL: 'http://localhost:4173', // Preview server port
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Assumes preview server is already running
  // Start manually with: npm run preview
});

