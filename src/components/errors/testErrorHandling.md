# Error Handling Test Plan

Run the app: `npm run dev` (or `npm run build && npm run preview` for prod checks).

1) Render error (route-level boundary)
- Open a route and append `?throw=render` (e.g., `http://localhost:5173/work-order?throw=render`).
- Expect: Route area shows ErrorFallback; “Try again” re-renders; console has one `[App]` error with context `{ scope:'route', component:'Outlet', route:'…' }`.

2) Region isolation (sidebar/header vs content)
- While step 1 is active, verify sidebar and header still render and work.
- Expect: Only the route area is replaced; sidebar/header remain interactive; logs reflect the affected scope only.

3) React Query — query errors (log + toast rate limit)
- On a data list (e.g., Downtime/Assets), force the query to fail (throw in service or block request in DevTools).
- Expect: One `[App]` error log with `{ scope:'react-query', component:'useDataQuery', queryKey:[…] }`; at most one error toast per query key within 10s.

4) React Query — mutation errors
- Perform a create/update/delete that fails (throw in service or block request).
- Expect: `[App]` error log with `{ scope:'react-query', component:'mutation', mutationKey: … }`; feature-specific toasts still show.

5) Logger de‑duplication
- Trigger the same error twice within 10s (repeat steps 1 or 3 quickly).
- Expect: Only the first error logs; after ~10s, it logs again on repeat.

6) Redaction of sensitive fields
- Temporarily call `logError` with context containing `token`/`password` in a dev-only path.
- Expect: Those keys appear as `"<redacted>"` in the logged payload.

7) ErrorFallback semantics (recoverable vs chunk‑load)
- Chunk-load: build, open a lazy route, then hot-swap to a new build without full refresh; navigate to that route to force “Loading chunk failed”.
- Expect: ErrorFallback hides “Try again” and shows “Reload” (chunk error).
- Optional: throw `createAppError('msg','UNKNOWN','fatal')` in a dev-only render path; Expect: “Try again” hidden for fatal, visible for recoverable.

8) Production gating for info logs (optional)
- Run `npm run build && npm run preview`; add a temporary `logInfo('test')` call.
- Expect: info logs suppressed in prod; error logs still output.

Notes
- Remove temporary throws/test calls after validation.
- Inspect logs in DevTools Console. Structure: `{ level, error:{ name,message,stack }, componentStack?, context:{ … } }`.

