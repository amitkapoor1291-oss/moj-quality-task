# Test Design Explanation

## 1. What I built and why

The task asks for one API test and one UI test and a view of what I would automate next. I chose scenarios that find
problems a simple "create then read" or "valid login" check would miss, and I included both positive and negative paths.
I implemented a few per layer, more than the single test the brief requires, to show the range.

**On "one endpoint":** I treated the `/pet` resource (create, update, read, find-by-status, delete) as the one area under test, because the consistency and integrity checks need more than one operation on the same resource. Single-operation checks are in the further scenarios.

| Layer | Scenario | Type | Why this one |
|-------|----------|------|--------------|
| API | After marking a pet sold, GET by id says sold, find-by-status "sold" includes it, and "available" no longer does | Positive, consistency | A service can pass a simple read test while its search results disagree with its record. Users trust lists as much as detail views |
| API | Two conflicting updates sent at the same moment leave exactly one complete record (name and status from the same write) | Robustness | Checks data integrity under concurrency: no half-and-half record |
| API | A non-numeric id (`abc`, `1.5.2`) is rejected with a client error, never a server error | Negative, invalid input | Bad input must not surface as a server fault. I assert the status class rather than an exact code because the public demo does not always follow its own Swagger definition |
| API | Create, delete, then GET returns 404 with a meaningful error | Negative, error handling | Proves deletion is real and the error is clear |
| UI | Keyboard-only user signs in: tab order username to password, Enter submits | Positive, accessibility | Login gates every journey, and keyboard access is a legal expectation for public services |
| UI | Wrong password shows "Invalid credentials" and stays on the login page | Negative | Checks the failure path and that the user is not let in |
| UI | Axe scan of the login page for WCAG 2.1 AA violations; fails on critical, reports the rest | Non-functional | Accessibility is a quality attribute that functional tests never see |

## 2. Structure and patterns

- **Two Playwright projects (`api`, `ui`)** so each layer runs alone. The API project never launches a browser.
- **Client / page object separation.** `PetClient` hides HTTP details, and page objects hide locators, so test files read as intent.
- **Fixtures** provide the client or page object and handle set-up and clean-up. `trackPet` deletes every pet a test created, even if the test fails.
- **Test data builder** (`buildPet`) creates valid, unique pets. Tests override only the field they care about.
- **User-facing locators** (placeholder, role, text) for resilience against markup changes.
- **No fixed sleeps.** I poll with `expect(...).toPass()` where the shared demo server may be briefly slow, and rely on Playwright's auto-waiting in the UI.
- **Configuration from environment**, so the same suite can run against another environment or a mock.
- **Reporting:** console list, HTML report and JUnit XML; screenshot on failure, trace on first retry.

## 3. When a check belongs at the API layer instead of the UI

My rule: test each rule at the lowest layer where it can fail, then keep a small number of UI tests for what only a browser can prove.

Better at the API (or lower):
- **Input validation rules** (required fields, length limits, duplicates). They are fast to run through the API and need no screen. At the lowest level they are unit tests of the validation itself.
- **Login failure variations** (empty fields, locked account, wrong case). Keep one UI test for the message, and cover the permutations against the authentication request.
- **Test data set-up.** To test searching or listing employees, create the data through the API instead of clicking through forms. It is faster and less likely to fail for unrelated reasons.
- **Permissions and roles.** Call the endpoints as different users and assert the responses; check the menu visibility in the UI once.
- **Response shape and contract** between the front end and the service, using consumer-driven contract tests.

Keep in the UI:
- One end-to-end journey per critical flow (login, add employee and see it listed).
- Rendering, navigation, keyboard use and accessibility, which only a browser shows.

## 4. Further scenarios, in priority order

Priority reflects likelihood of a real defect and the impact of it reaching users. "Best layer" shows where each rule is cheapest and most reliable to check.

### Petstore API

| # | Scenario | Approach | Rationale | Best layer |
|---|----------|----------|-----------|------------|
| 1 | Create or update with missing required fields (`name`, `photoUrls`) or malformed JSON | Send bad bodies; assert a client error and a clear message; record actual demo behaviour against the Swagger definition | Invalid input is the most common real-world failure and must never corrupt data or return a server error | API, with unit tests for the validators |
| 2 | Negative, zero and very large ids on GET and DELETE | Parameterise the id; assert a client error | Stops server errors leaking to users | API |
| 3 | Delete the same pet twice | Second call must return 404 | Shows retries are safe | API |
| 4 | Find-by-status with an invalid or empty status | Assert a client error and a clear message | Search inputs are user-controlled | API |
| 5 | Response contract | Validate responses against the published schema; add a consumer-driven contract test for any service that reads pets | Catches breaking changes before integration | Contract |
| 6 | `api_key` header on delete | Missing, wrong and valid keys | Access control | API |
| 7 | Hostile text in `name` (markup, very long, unusual characters) | Store, read back; assert unchanged and safely returned | Security and robustness | API |
| 8 | Latency smoke check | Threshold on `GET /pet/{id}` | Early signal of regressions | API (performance) |
| 9 | Create twice with the same id | Document and assert the behaviour | Defines the expected semantics | API |

### OrangeHRM UI

| # | Scenario | Approach | Rationale | Best layer |
|---|----------|----------|-----------|------------|
| 1 | Login with empty fields | Assert required-field messages | Basic input validation | One UI check; the rule itself at API |
| 2 | Logout, then open a protected URL | Assert redirect to login | Session handling is security-relevant and only a browser shows the redirect | UI |
| 3 | Add an employee and find them in the list | One end-to-end journey; clean up through the API | The most critical business journey | UI (one test) |
| 4 | Add employee with missing required fields | Assert errors and nothing saved | Validation protects data | Rules at API or unit; one UI check that the message appears |
| 5 | Search and filter employees, including "no records found" | Create the data through the API, assert in the UI | Fast, reliable set-up | API for data, UI for display |
| 6 | Duplicate employee id | Assert it is rejected | Data integrity | API |
| 7 | Role check: a standard user cannot see administration menus | Call endpoints as a standard user; one UI menu check | Access control | API plus one UI check |
| 8 | Accessibility scans of the dashboard and add-employee form | Same quality ratchet as the login scan | Accessibility is a quality attribute | UI |
| 9 | Error messages announced to assistive technology | Check alert or live-region roles | Users of screen readers must be told | UI |
| 10 | Session timeout and back-button behaviour | Expire the session; press back | Prevents stale or exposed pages | UI |

## 5. Challenges and trade-offs

- **Time-boxed.** I stayed within an hour of design effort by implementing a small number of scenarios chosen for what they reveal, not for breadth. The listed scenarios show where I would invest next.
- **Accessibility threshold.** The axe test fails only on critical violations so it is useful from day one. Lower-impact findings are reported, and the threshold can be tightened over time.
- **Concurrency test.** It sends two updates at once; a shared public server may order them differently each run, so the test accepts either complete write and rejects only a mixed record.
- **Shared public environments.** Anyone can change the Petstore data, and the demo sites can reset or go down. I used unique ids, clean-up in fixtures and polling to reduce false failures. A real project would use its own test environment with controlled data.
- **Locators on a site I do not own.** I used role, placeholder and text locators. If the demo changes its markup, only the page objects need to change.
- **Not implemented, on purpose:** reuse of a saved login session for later tests (not needed until there are more logged-in tests), cross-browser runs (one browser is enough for this scope), and contract tests (outlined above).
- **How I would wire it into delivery:** run the API project on every commit, the UI project on merge and nightly, publish the HTML and JUnit reports, and fail the pipeline on test failure.
