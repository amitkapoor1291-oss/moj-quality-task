# Recorded test run

Run on 15 November 2026 against the live public sites (Swagger Petstore and the OrangeHRM demo).
Environment: Windows, Node.js v26.13.1, npm 11.20.0, Playwright Test with Chromium.

## API project (`npm run test:api`): 5 passed (6.0s)

| Result | Test |
|---|---|
| passed | two conflicting updates at the same moment leave one complete record, never a mix |
| passed | GET /pet/abc (invalid id) is rejected with a client error, never a server error |
| passed | GET /pet/1.5.2 (invalid id) is rejected with a client error, never a server error |
| passed | a status change is reflected consistently by GET by id and by find-by-status |
| passed | GET /pet/{id} for a deleted pet returns 404 with an error body |

## UI project (`npm run test:ui`): 3 passed (26.4s)

| Result | Test |
|---|---|
| passed | a wrong password is rejected with an error and the user stays on the login page |
| passed | a keyboard-only user can sign in: tab order is correct and Enter submits |
| passed | the login page has no critical WCAG 2.1 AA violations |

Screenshot of the HTML report: `test-report.png` (All 8, Passed 8, Failed 0, Flaky 0, Skipped 0).

Total: 8 passed, 0 failed, 0 flaky, 0 skipped.

The public demo sites are shared and can respond slowly or change, so timings and results may vary between runs.
Re-run with `npm test`; open the HTML report with `npm run report`.
