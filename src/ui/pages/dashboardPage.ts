import { Page, expect } from '@playwright/test';

/** Page object for the post-login landing page. */
export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard\/index/);
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  }
}
