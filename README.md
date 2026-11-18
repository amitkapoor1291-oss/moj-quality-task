# Quality Engineering Technical Task

Automated tests for two applications, built with **Playwright Test (TypeScript)**:

| Layer | Application | Scenarios implemented |
|-------|-------------|-----------------------|
| API   | Swagger Petstore (`https://petstore.swagger.io/v2`) | a status change is consistent across GET by id and find-by-status; two conflicting updates at once leave one complete record; invalid ids get a client error, never a server error; a deleted pet returns 404 with a clear error |
| UI    | OrangeHRM demo (`https://opensource-demo.orangehrmlive.com`) | keyboard-only login (tab order and Enter); wrong password is rejected; login page has no critical WCAG 2.1 AA violations (axe-core) |

The approach, the reasoning for API versus UI, and the further scenarios in priority order are in
[`docs/TEST_DESIGN.md`](docs/TEST_DESIGN.md).

## Prerequisites

- Node.js 18 or newer (tested with Node 26 on Windows)
- Internet access to the two demo sites

## Set up and run

```bash
npm install
npx playwright install chromium     # one-off, UI tests only
npm test                            # runs API and UI projects
```

Run one layer on its own:

```bash
npm run test:api     # no browser is launched
npm run test:ui
```

## Reports

- Console: list reporter output on every run.
- HTML report: `npm run report` (opens `playwright-report/index.html`).
- JUnit XML: `test-results/junit.xml` for CI tools.
- Recorded live run: see `docs/TEST_RUN.md` and `docs/test-report.png` (8 passed on 15 Nov 2026).
- On failure: a screenshot is saved; a trace is saved on the first retry (retries are on when `CI=1`).

## Configuration (all optional)

Copy `.env.example` values into your shell if you need to override anything.

| Variable | Default |
|----------|---------|
| `PETSTORE_BASE_URL` | `https://petstore.swagger.io/v2/` |
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` |
| `ORANGEHRM_USERNAME` | `Admin` (public demo credential) |
| `ORANGEHRM_PASSWORD` | `admin123` (public demo credential) |

## Project layout

```
playwright.config.ts          two projects: api, ui; reporters
src/config/env.ts             settings from environment
src/api/models/pet.ts         typed request/response shapes
src/api/data/petFactory.ts    unique test data builder
src/api/clients/petClient.ts  thin client over the /pet endpoints
src/api/fixtures.ts           fixtures: client, automatic clean-up of created pets
src/ui/pages/                 page objects (login, dashboard)
src/ui/fixtures.ts            fixtures: page objects ready to use
tests/api/pet.api.spec.ts     API tests
tests/ui/login.ui.spec.ts     UI login tests
tests/ui/accessibility.ui.spec.ts  accessibility gate (axe-core)
docs/TEST_DESIGN.md           test design explanation and prioritised scenarios
docs/TEST_RUN.md              recorded results of a live run
docs/test-report.png          screenshot of the HTML report from that run
```

## Notes and known limits

- Both sites are public, shared and outside our control. Tests use unique data, clean up after themselves and poll
  instead of sleeping, but an outage or a reset of a demo site will fail a run for reasons unrelated to the tests.
- The accessibility test fails only on **critical** violations and lists the rest in the report. If the demo site has a critical
  violation, the test will say which rule; change `FAIL_ON` in `tests/ui/accessibility.ui.spec.ts` to tighten or relax this.
- Find-by-status can be slow on the public Petstore because it returns very large lists, so that test allows extra time.
- If the OrangeHRM demo changes its screens, only the page objects in `src/ui/pages` need updating.
