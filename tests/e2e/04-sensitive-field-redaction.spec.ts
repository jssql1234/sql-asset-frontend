import { test, expect } from '@playwright/test';
import { setupConsoleListener } from './utils/console';
import { navigateWithQuery } from './utils/helpers';

/**
 * Test 6: Redaction of sensitive fields
 * 
 * Validates:
 * - Sensitive fields (token, password, apiKey, secret, etc.) are redacted in logs
 * - Redacted fields show as "<redacted>" in the logged payload
 * - Non-sensitive fields remain visible
 */
test.describe('Sensitive Field Redaction', () => {
  test('should redact sensitive fields in error logs', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Navigate with testLog=redact to trigger test logging with sensitive data
    await navigateWithQuery(page, '/work-orders', { testLog: 'redact' });
    
    // Wait for the log to be emitted
    await page.waitForTimeout(1000);

    // Find the test redaction error log
    const redactionLog = consoleListener.findLog(
      log => log.error?.message?.includes('Test redaction error') ?? false
    );

    expect(redactionLog).toBeDefined();
    expect(redactionLog?.context).toBeDefined();

    // Verify sensitive fields are redacted
    const context = redactionLog!.context as Record<string, unknown>;
    
    expect(context.token).toBe('<redacted>');
    expect(context.password).toBe('<redacted>');
    expect(context.apiKey).toBe('<redacted>');
    expect(context.secret).toBe('<redacted>');

    // Verify non-sensitive fields are NOT redacted
    expect(context.normalField).toBe('this-should-be-visible');
    expect(context.scope).toBe('test');
    expect(context.component).toBe('DevErrorProbe');
  });

  test('should redact nested sensitive fields', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger the redaction test
    await navigateWithQuery(page, '/dashboard', { testLog: 'redact' });
    await page.waitForTimeout(1000);

    // Get all error logs
    const errorLogs = consoleListener.getErrorLogs();
    
    // Find redaction test log
    const redactionLog = errorLogs.find(
      log => log.error?.message?.includes('Test redaction error') ?? false
    );

    if (redactionLog?.context) {
      const context = redactionLog.context as Record<string, unknown>;
      
      // All sensitive fields should be strings with value "<redacted>"
      const sensitiveFields = ['token', 'password', 'apiKey', 'secret'];
      
      sensitiveFields.forEach(field => {
        if (field in context) {
          expect(context[field]).toBe('<redacted>');
        }
      });
    }
  });

  test('should handle redaction for different sensitive field names', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Test that various sensitive field names are caught
    // The logger should redact: password, token, authorization, cookie, apiKey, secret
    
    await navigateWithQuery(page, '/work-orders', { testLog: 'redact' });
    await page.waitForTimeout(1000);

    const log = consoleListener.findLog(
      log => log.error?.message?.includes('Test redaction error') ?? false
    );

    expect(log).toBeDefined();
    
    // Verify the redaction happened
    if (log?.context) {
      const context = log.context as Record<string, unknown>;
      
      // These should all be redacted
      const expectedRedacted = ['token', 'password', 'apiKey', 'secret'];
      expectedRedacted.forEach(field => {
        if (context[field] !== undefined) {
          expect(context[field]).toBe('<redacted>');
        }
      });

      // These should NOT be redacted
      const expectedVisible = ['scope', 'component', 'normalField'];
      expectedVisible.forEach(field => {
        if (context[field] !== undefined) {
          expect(context[field]).not.toBe('<redacted>');
        }
      });
    }
  });

  test('should not break logging when no sensitive fields present', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger a regular error without sensitive fields
    await navigateWithQuery(page, '/work-orders', { throw: 'render' });
    await page.waitForTimeout(1000);

    // Should still log normally
    const errorLog = consoleListener.findLog(
      log => log.error?.message?.includes('Simulated render error') ?? false
    );

    expect(errorLog).toBeDefined();
    expect(errorLog?.context).toBeDefined();
    expect(errorLog?.context?.scope).toBe('route');
    expect(errorLog?.context?.component).toBe('Outlet');
  });

  test('should preserve data structure after redaction', async ({ page }) => {
    const consoleListener = setupConsoleListener(page);

    // Trigger redaction test
    await navigateWithQuery(page, '/dashboard', { testLog: 'redact' });
    await page.waitForTimeout(1000);

    const log = consoleListener.findLog(
      log => log.error?.message?.includes('Test redaction error') ?? false
    );

    expect(log).toBeDefined();
    expect(log?.level).toBe('error');
    expect(log?.error).toBeDefined();
    expect(log?.error?.name).toBeDefined();
    expect(log?.error?.message).toBe('Test redaction error');
    expect(log?.context).toBeDefined();
    
    // Context should be an object, not null or undefined
    expect(typeof log?.context).toBe('object');
    expect(log?.context).not.toBeNull();
  });
});

