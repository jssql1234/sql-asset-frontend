# Error Handling E2E Test Suite

This directory contains automated end-to-end tests for the application's error handling infrastructure using Playwright.

## Overview

The test suite automates all scenarios from the [Error Handling Test Plan](../../src/components/errors/testErrorHandling.md), providing comprehensive coverage of:

- Error boundaries and fallback UI
- Error logging and context tracking
- Logger deduplication
- Sensitive field redaction
- React Query error handling
- Production/development environment gating

## Test Files

| Test File | Coverage | Test Plan Reference |
|-----------|----------|---------------------|
| `01-render-errors.spec.ts` | Render errors and region isolation | Tests 1 & 2 |
| `02-react-query-errors.spec.ts` | React Query query and mutation errors | Tests 3 & 4 |
| `03-logger-deduplication.spec.ts` | Error deduplication within time windows | Test 5 |
| `04-sensitive-field-redaction.spec.ts` | Sensitive field redaction in logs | Test 6 |
| `05-error-fallback-semantics.spec.ts` | ErrorFallback UI behavior | Test 7 |
| `06-production-gating.spec.ts` | Production log filtering | Test 8 |

## Prerequisites

- Node.js installed
- Dependencies installed: `npm install`
- Playwright browsers installed: `npx playwright install chromium`

## Running Tests

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tests with UI (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test 01-render-errors.spec.ts
```

### Run specific test
```bash
npx playwright test -g "should catch render error"
```

## Test Infrastructure

### Console Monitoring
The `utils/console.ts` module provides utilities for monitoring and parsing console logs:
- Captures `[App]` logs emitted by the logger
- Parses structured log messages
- Provides filters for error/warn/info levels
- Enables assertions on log content and context

### Helper Utilities
The `utils/helpers.ts` module provides common test helpers:
- Navigation with query parameters
- Network request blocking/failing
- Wait utilities
- Element checking

## DevErrorProbe Component

Tests leverage the `DevErrorProbe` component (enabled only in development) to trigger specific error scenarios via URL query parameters:

| Query Parameter | Effect |
|----------------|--------|
| `?throw=render` | Triggers a render error |
| `?throw=fatal` | Triggers a fatal error (hides "Try again") |
| `?throw=chunk` | Triggers a chunk load error |
| `?testLog=redact` | Logs an error with sensitive fields for redaction testing |
| `?testLog=info` | Emits an info log for production gating tests |

**Example:**
```
http://localhost:5173/work-orders?throw=render
```

## Test Scenarios

### Test 1 & 2: Render Errors and Region Isolation
**File:** `01-render-errors.spec.ts`

Verifies:
- ✅ Route-level error boundary catches render errors
- ✅ ErrorFallback component displays with "Try again" button
- ✅ Sidebar and header remain functional when route area has error
- ✅ Error logged with correct context (scope: 'route', component: 'Outlet')
- ✅ Error recovery on navigation

### Test 3 & 4: React Query Errors
**File:** `02-react-query-errors.spec.ts`

Verifies:
- ✅ Query errors logged with context (scope: 'react-query', queryKey)
- ✅ Mutation errors logged with context (scope: 'react-query', mutationKey)
- ✅ Toast rate limiting (max 1 toast per 10s per query key)
- ✅ Error deduplication for queries

**Note:** Some tests may pass without assertions if the application uses mock data instead of real API endpoints.

### Test 5: Logger Deduplication
**File:** `03-logger-deduplication.spec.ts`

Verifies:
- ✅ Identical errors within 10s window are deduplicated
- ✅ Only first occurrence is logged
- ✅ After 10s window, errors can be logged again
- ✅ Different error types or contexts are not deduplicated
- ✅ Deduplication signature includes message + scope + component + route

### Test 6: Sensitive Field Redaction
**File:** `04-sensitive-field-redaction.spec.ts`

Verifies:
- ✅ Sensitive fields (password, token, apiKey, secret, authorization, cookie) are redacted
- ✅ Redacted fields show as `"<redacted>"` in logs
- ✅ Non-sensitive fields remain visible
- ✅ Nested sensitive fields are redacted
- ✅ Data structure preserved after redaction

### Test 7: ErrorFallback Semantics
**File:** `05-error-fallback-semantics.spec.ts`

Verifies:
- ✅ Recoverable errors show "Try again" button
- ✅ Fatal errors hide "Try again" button
- ✅ Chunk load errors hide "Try again" button
- ✅ "Reload" button always visible
- ✅ Error messages displayed in fallback UI
- ✅ Reload button refreshes the page

### Test 8: Production Gating
**File:** `06-production-gating.spec.ts`

Verifies:
- ✅ Info logs appear in development mode
- ✅ Info logs suppressed in production mode
- ✅ Error logs work in all environments
- ✅ DevErrorProbe disabled in production

**Running Production Tests:**
```bash
# Build for production
npm run build

# Start preview server (runs on port 4173)
npm run preview

# Update playwright.config.ts baseURL to http://localhost:4173
# Then run production-specific tests (currently skipped by default)
npm run test:e2e
```

## Continuous Integration

For CI environments, tests run with:
- Retries enabled (2 retries)
- Single worker (no parallelization)
- Headless mode
- Automatic dev server startup

## Troubleshooting

### Tests fail with "Something went wrong" not found
- Ensure DevErrorProbe is enabled (development mode only)
- Check that query parameters are being passed correctly
- Verify error boundaries are properly configured

### Console logs not captured
- Check that logs use the `[App]` prefix
- Verify logger is emitting structured JSON
- Check browser console for raw output

### Network interception not working
- Ensure API endpoints match the URL patterns in tests
- Check that requests are being made (not using mock data)
- Verify route patterns in `page.route()` calls

### Flaky tests
- Increase wait times if timing-related
- Check for race conditions with async operations
- Ensure proper cleanup between tests

## Extending Tests

### Adding New Test Scenarios

1. Create a new spec file in `tests/e2e/`
2. Use the console listener utility for log verification
3. Follow naming convention: `XX-test-name.spec.ts`
4. Update this README with new test coverage

### Adding New Query Parameters

1. Update `DevErrorProbe.tsx` with new error scenario
2. Add corresponding tests
3. Document in the DevErrorProbe table above

### Adding Custom Utilities

Add reusable test helpers to `utils/` directory:
- `console.ts` - Console log monitoring
- `helpers.ts` - General test utilities

## Best Practices

1. **Use descriptive test names** - Test names should clearly describe what is being tested
2. **Keep tests independent** - Each test should be able to run in isolation
3. **Use proper waits** - Avoid arbitrary timeouts, prefer `waitFor` methods
4. **Clean up after tests** - Clear console listeners, reset state
5. **Document edge cases** - Add comments for non-obvious test logic
6. **Verify both positive and negative cases** - Test what should and shouldn't happen

## References

- [Playwright Documentation](https://playwright.dev/)
- [Error Handling Test Plan](../../src/components/errors/testErrorHandling.md)
- [Logger Implementation](../../src/utils/logger.ts)
- [Error Types](../../src/types/errors.ts)

