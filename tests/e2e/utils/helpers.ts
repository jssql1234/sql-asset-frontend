import type { Page } from '@playwright/test';

/**
 * Wait for a specific amount of time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * Navigate to a route with query parameters
 */
export async function navigateWithQuery(
  page: Page,
  path: string,
  queryParams: Record<string, string>
): Promise<void> {
  // Get the base URL from page context, or use a default
  const currentUrl = page.url();
  const baseUrl = currentUrl && currentUrl !== 'about:blank' 
    ? currentUrl 
    : 'http://localhost:5173';
  
  // Create URL object
  const url = new URL(path, baseUrl);
  
  // Add query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  await page.goto(url.toString());
}

/**
 * Block a specific network request pattern
 */
export async function blockRequest(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.route(urlPattern, route => route.abort('failed'));
}

/**
 * Make a request fail with a specific status code
 */
export async function failRequest(
  page: Page,
  urlPattern: string | RegExp,
  statusCode: number = 500
): Promise<void> {
  await page.route(urlPattern, route =>
    route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Simulated failure' }),
    })
  );
}

/**
 * Wait for React Query to finish loading
 */
export async function waitForQueryToSettle(page: Page, timeout = 5000): Promise<void> {
  // Wait for any loading states to complete
  await page.waitForTimeout(500); // Small initial wait
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Get the text content of an element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = await page.locator(selector);
  return (await element.textContent()) || '';
}

/**
 * Check if an element exists on the page
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}

/**
 * Wait for element to be visible
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<void> {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}

