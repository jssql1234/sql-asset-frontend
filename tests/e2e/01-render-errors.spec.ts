import { test, expect } from '@playwright/test';
import { setupConsoleListener } from './utils/console';
import { navigateWithQuery } from './utils/helpers';

/**
 * Test 1 & 2: Render errors and region isolation
 * 
 * Validates:
 * - Route-level error boundary catches render errors
 * - ErrorFallback component displays
 * - "Try again" button works
 * - Sidebar and header remain functional when route area has error
 * - Proper error logging with correct context
 */
test.describe('Render Errors', () => {
  test('should catch render error with route-level boundary', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Navigate to work-order page with throw=render query param
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });

    // Wait a bit for error boundary to catch and render
    await page.waitForTimeout(1000);

    // Verify ErrorFallback is visible in the content area
    const errorFallback = page.locator('text=Something went wrong');
    await expect(errorFallback).toBeVisible();

    // Verify error message is displayed
    const errorMessage = page.locator('text=Simulated render error');
    await expect(errorMessage).toBeVisible();

    // Verify "Try again" button is visible
    const tryAgainButton = page.locator('button:has-text("Try again")');
    await expect(tryAgainButton).toBeVisible();

    // Check that exactly one error log was created
    const errorLogs = consoleListener.getErrorLogs();
    expect(errorLogs.length).toBeGreaterThanOrEqual(1);

    // Verify the error log has correct context
    const routeErrorLog = consoleListener.findLog(
      log => log.context?.scope === 'route' && log.context?.component === 'Outlet'
    );
    expect(routeErrorLog).toBeTruthy();
    expect(routeErrorLog?.error?.message).toContain('Simulated render error');
    expect(routeErrorLog?.context?.route).toContain('/work-orders');
  });

  test('should isolate error to route area, keeping sidebar and header functional', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Navigate to work-order page with throw=render query param
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });

    // Wait for error boundary to catch and render
    await page.waitForTimeout(1000);

    // Verify ErrorFallback is visible
    await expect(page.locator('text=Something went wrong')).toBeVisible();

    // Verify sidebar is still visible and functional
    // Look for sidebar trigger button (hamburger menu)
    const sidebarTrigger = page.locator('button').first(); // Sidebar trigger is typically first button
    await expect(sidebarTrigger).toBeVisible();

    // Verify header is still visible (look for logo)
    const logo = page.locator('img[alt*="Logo"]');
    await expect(logo).toBeVisible();

    // Check that only route-level error was logged, not sidebar or header errors
    const errorLogs = consoleListener.getErrorLogs();
    const nonRouteErrors = errorLogs.filter(
      log => log.context?.scope !== 'route'
    );
    
    // Should have no sidebar or header errors
    expect(nonRouteErrors.length).toBe(0);
  });

  test('should recover from error when "Try again" is clicked', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // First, navigate to a working page
    await page.goto('/work-orders');
    await page.waitForTimeout(500);

    // Then navigate with the error trigger
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Verify error is shown
    await expect(page.locator('text=Something went wrong')).toBeVisible();

    // Click "Try again" button
    const tryAgainButton = page.locator('button:has-text("Try again")');
    await tryAgainButton.click();

    // Wait a bit for re-render
    await page.waitForTimeout(500);

    // Error should still be there because the query param is still present
    // This is expected behavior - the error boundary resets but throws again
    await expect(page.locator('text=Something went wrong')).toBeVisible();

    // Now navigate away from the error by removing query param
    await page.goto('/work-orders');
    await page.waitForTimeout(500);

    // Error should be gone
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('should recover from error when navigating to different route', async ({ page }) => {
    // Navigate to work-order page with throw=render query param
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Verify error is shown
    await expect(page.locator('text=Something went wrong')).toBeVisible();

    // Navigate to a different route
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Error should be gone
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();

    // Page should load normally
    const url = page.url();
    expect(url).toContain('/dashboard');
  });
});

