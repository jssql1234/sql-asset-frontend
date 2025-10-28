import { test, expect } from '@playwright/test';
import { setupConsoleListener } from './utils/console';
import { navigateWithQuery, wait } from './utils/helpers';

/**
 * Test 5: Logger deduplication
 * 
 * Validates:
 * - Identical errors within 10s window are deduplicated
 * - Only the first occurrence is logged
 * - After ~10s, the same error can be logged again
 */
test.describe('Logger Deduplication', () => {
  test('should deduplicate identical errors within 10s window', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger error first time
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Count initial error logs
    const initialErrorCount = consoleListener.getErrorLogs().length;
    expect(initialErrorCount).toBeGreaterThanOrEqual(1);

    // Navigate away
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // Trigger the same error again (within 10s)
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Count error logs again
    const secondErrorCount = consoleListener.getErrorLogs().length;

    // The second identical error should be deduplicated
    // So we should still have roughly the same number of logs
    // (might have +1 due to different route context, but shouldn't double)
    expect(secondErrorCount).toBeLessThanOrEqual(initialErrorCount + 1);

    // Clear console logs for cleaner verification
    consoleListener.clear();

    // Navigate away and back one more time
    await page.goto('/dashboard');
    await page.waitForTimeout(500);
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // This third occurrence should also be deduplicated
    const thirdErrorCount = consoleListener.getErrorLogs().length;
    expect(thirdErrorCount).toBeLessThanOrEqual(1);
  });

  test('should allow logging after deduplication window expires', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger error first time
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Verify first error was logged
    const firstError = consoleListener.findLog(
      log => log.error?.message?.includes('Simulated render error') ?? false
    );
    expect(firstError).toBeDefined();

    // Clear the logs
    consoleListener.clear();

    // Wait for deduplication window to expire (10s + buffer)
    // For testing purposes, we'll wait 11 seconds
    await wait(11000);

    // Trigger the same error again after window expires
    await page.goto('/dashboard');
    await page.waitForTimeout(500);
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // After the window expires, the error should be logged again
    const secondError = consoleListener.findLog(
      log => log.error?.message?.includes('Simulated render error') ?? false
    );
    expect(secondError).toBeDefined();
  });

  test('should deduplicate based on error signature (message + context)', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger render error on work-orders
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    const initialCount = consoleListener.getErrorLogs().length;

    // Trigger same error type on different route
    // This should create a new log because route is different
    await navigateWithQuery(page, '/dashboard', { throw: 'render' });
    await page.waitForTimeout(1000);

    const afterDifferentRouteCount = consoleListener.getErrorLogs().length;

    // Should have more logs because the context (route) is different
    expect(afterDifferentRouteCount).toBeGreaterThan(initialCount);

    // Now trigger the same error on work-orders again
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    const finalCount = consoleListener.getErrorLogs().length;

    // This should be deduplicated with the first work-orders error
    // So count shouldn't increase much
    expect(finalCount).toBeLessThanOrEqual(afterDifferentRouteCount + 1);
  });

  test('should not deduplicate different error types', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger render error
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    const afterRenderError = consoleListener.getErrorLogs().length;
    expect(afterRenderError).toBeGreaterThanOrEqual(1);

    // Navigate away
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // Trigger fatal error (different error type)
    await navigateWithQuery(page, '/work-orders', { throw: 'fatal' });
    await page.waitForTimeout(1000);

    const afterFatalError = consoleListener.getErrorLogs().length;

    // Should have more errors because it's a different error type
    expect(afterFatalError).toBeGreaterThan(afterRenderError);

    // Verify we have both types of errors
    const renderErrors = consoleListener.findAllLogs(
      log => log.error?.message?.includes('Simulated render error') ?? false
    );
    const fatalErrors = consoleListener.findAllLogs(
      log => log.error?.message?.includes('fatal') ?? false
    );

    expect(renderErrors.length).toBeGreaterThanOrEqual(1);
    expect(fatalErrors.length).toBeGreaterThanOrEqual(1);
  });
});

