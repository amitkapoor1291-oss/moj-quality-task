import { Locator, Page, expect } from '@playwright/test';

/** Page object for the OrangeHRM login screen. Locators use user-facing attributes (placeholder, role, text). */
export class LoginPage {
  private readonly username: Locator;
  private readonly password: Locator;
  private readonly loginButton: Locator;
  private readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.invalidCredentialsMessage = page.getByText('Invalid credentials');
  }

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
    await expect(this.loginButton).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  /**
   * Completes login using the keyboard only (no mouse click on the button).
   * Also proves the tab order: after the username the next stop is the password field.
   */
  async loginWithKeyboardOnly(username: string, password: string): Promise<void> {
    await this.username.focus();
    await this.page.keyboard.type(username);
    await this.page.keyboard.press('Tab');
    await expect(this.password).toBeFocused();
    await this.page.keyboard.type(password);
    await this.page.keyboard.press('Enter');
  }

  async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.invalidCredentialsMessage).toBeVisible();
    await expect(this.page).toHaveURL(/auth\/login/);
  }
}
