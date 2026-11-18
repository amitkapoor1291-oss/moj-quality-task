import { test } from '../../src/ui/fixtures';
import { config } from '../../src/config/env';

/**
 * Scenario area under test: OrangeHRM login.
 * Login gates every other journey, so it is the most valuable place for UI checks.
 * Further scenarios, and which of them belong at the API layer instead, are in docs/TEST_DESIGN.md.
 */
test.describe('OrangeHRM UI: login', () => {
  test('a keyboard-only user can sign in: tab order is correct and Enter submits', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginWithKeyboardOnly(config.orangeHrmUsername, config.orangeHrmPassword);
    await dashboardPage.expectLoaded();
  });

  test('a wrong password is rejected with an error and the user stays on the login page', async ({ loginPage }) => {
    await loginPage.login(config.orangeHrmUsername, 'not-the-password');
    await loginPage.expectInvalidCredentialsError();
  });
});
