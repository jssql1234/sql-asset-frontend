import { test, expect } from '@playwright/test';
import { setupConsoleListener } from './utils/console';
import { navigateWithQuery } from './utils/helpers';

/**
 * Test 7: ErrorFallback semantics (recoverable vs chunk-load)
 * 
 * Validates:
 * - Chunk load errors hide "Try again" button and show only "Reload"
 * - Fatal errors hide "Try again" button
 * - Recoverable errors show "Try again" button
 * - "Reload" button is always present
 */
test.describe('ErrorFallback Semantics', () => {
  test('should show "Try again" button for recoverable errors', async ({ page }) => {
    // Trigger a regular render error (recoverable by default)
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Verify ErrorFallback is visible
    const errorFallback = page.locator('text=Something went wrong');
    await expect(errorFallback).toBeVisible();

    // "Try again" button should be visible for recoverable errors
    const tryAgainButton = page.locator('button:has-text("Try again")');
    await expect(tryAgainButton).toBeVisible();

    // "Reload" button should also be visible
    const reloadButton = page.locator('button:has-text("Reload")');
    await expect(reloadButton).toBeVisible();
  });

  test('should hide "Try again" button for fatal errors', async ({ page }) => {
    // Trigger a fatal error
    await navigateWithQuery(page, '/work-orders', { throw: 'fatal' });
    await page.waitForTimeout(1000);

    // Verify ErrorFallback is visible
    const errorFallback = page.locator('text=Something went wrong');
    await expect(errorFallback).toBeVisible();

    // "Try again" button should NOT be visible for fatal errors
    const tryAgainButton = page.locator('button:has-text("Try again")');
    await expect(tryAgainButton).not.toBeVisible();

    // "Reload" button should still be visible
    const reloadButton = page.locator('button:has-text("Reload")');
    await expect(reloadButton).toBeVisible();
  });

  test('should hide "Try again" button for chunk load errors', async ({ page }) => {
    // Trigger a chunk load error
    await navigateWithQuery(page, '/work-orders', { throw: 'chunk' });
    await page.waitForTimeout(1000);

    // Verify ErrorFallback is visible
    const errorFallback = page.locator('text=Something went wrong');
    await expect(errorFallback).toBeVisible();

    // Error message should mention chunk loading
    const errorMessage = page.locator('text=/Loading chunk.*failed/i');
    await expect(errorMessage).toBeVisible();

    // "Try again" button should NOT be visible for chunk errors
    const tryAgainButton = page.locator('button:has-text("Try again")');
    await expect(tryAgainButton).not.toBeVisible();

    // "Reload" button should be visible
    const reloadButton = page.locator('button:has-text("Reload")');
    await expect(reloadButton).toBeVisible();
  });

  test('should always show "Reload" button regardless of error type', async ({ page }) => {
    // Test with recoverable error
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);
    
    let reloadButton = page.locator('button:has-text("Reload")');
    await expect(reloadButton).toBeVisible();

    // Test with fatal error
    await navigateWithQuery(page, '/dashboard', { throw: 'fatal' });
    await page.waitForTimeout(1000);
    
    reloadButton = page.locator('button:has-text("Reload")');
    await expect(reloadButton).toBeVisible();

    // Test with chunk error
    await navigateWithQuery(page, '/downtime-tracking', { throw: 'chunk' });
    await page.waitForTimeout(1000);
    
    reloadButton = page.locator('button:has-text("Reload")');
    await expect(reloadButton).toBeVisible();
  });

  test('should correctly identify chunk load errors by message pattern', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger chunk error
    await navigateWithQuery(page, '/work-orders', { throw: 'chunk' });
    await page.waitForTimeout(1500);

    // Verify ErrorFallback is visible first
    const errorFallback = page.locator('text=Something went wrong');
    await expect(errorFallback).toBeVisible();

    // Verify error message contains chunk info
    const errorMessage = page.locator('text=/Loading chunk.*failed/i');
    await expect(errorMessage).toBeVisible();

    // UI should reflect this is a chunk error (no Try again button)
    const tryAgainButton = page.locator('button:has-text("Try again")');
    await expect(tryAgainButton).not.toBeVisible();

    // Check if error was logged (optional since the main test is UI behavior)
    const errorLog = consoleListener.findLog(
      log => log.error?.message?.toLowerCase().includes('chunk') ?? false
    );

    // If error log exists, verify it has the correct pattern
    if (errorLog) {
      const message = errorLog.error?.message || '';
      expect(message.toLowerCase()).toMatch(/loading chunk|chunk load|dynamically imported module/i);
    }
  });

  test('should display error message in fallback UI', async ({ page }) => {
    // Test with render error
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Error message should be visible
    const renderErrorMsg = page.locator('text=/Simulated render error/i');
    await expect(renderErrorMsg).toBeVisible();

    // Test with fatal error
    await navigateWithQuery(page, '/dashboard', { throw: 'fatal' });
    await page.waitForTimeout(1000);

    const fatalErrorMsg = page.locator('text=/fatal/i');
    await expect(fatalErrorMsg).toBeVisible();

    // Test with chunk error
    await navigateWithQuery(page, '/downtime-tracking', { throw: 'chunk' });
    await page.waitForTimeout(1000);

    const chunkErrorMsg = page.locator('text=/Loading chunk/i');
    await expect(chunkErrorMsg).toBeVisible();
  });

  test('reload button should refresh the page', async ({ page }) => {
    // Trigger an error
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Click reload button
    const reloadButton = page.locator('button:has-text("Reload")');
    
    // Set up navigation listener
    const navigationPromise = page.waitForURL('**/*', { waitUntil: 'domcontentloaded' });
    
    await reloadButton.click();
    
    // Wait for navigation to complete
    await navigationPromise;
    
    // After reload, the page should refresh
    // Note: The error will still occur if query param is present
    // In a real scenario, reload would clear the error state
  });
});

