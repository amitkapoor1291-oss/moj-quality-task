import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/ui/fixtures';

/**
 * Non-functional gate: the login page is scanned against WCAG 2.0/2.1 level A and AA rules.
 *
 * Design choice ("quality ratchet"): the test FAILS on critical violations, and reports every
 * other violation as an annotation and attachment without failing. That blocks the worst
 * problems now, keeps the rest visible, and lets the threshold be tightened over time
 * (change FAIL_ON below) without rewriting the test.
 */
const FAIL_ON = ['critical'];

test.describe('OrangeHRM UI: accessibility', () => {
  test('the login page has no critical WCAG 2.1 AA violations', async ({ page, loginPage }, testInfo) => {
    void loginPage; // the fixture has already opened the login page

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await testInfo.attach('axe-results.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    for (const violation of results.violations) {
      testInfo.annotations.push({
        type: `a11y-${violation.impact ?? 'unknown'}`,
        description: `${violation.id}: ${violation.help} (${violation.nodes.length} element(s))`,
      });
    }

    const blocking = results.violations.filter((v) => FAIL_ON.includes(v.impact ?? ''));
    expect(blocking, `Blocking accessibility violations: ${blocking.map((v) => v.id).join(', ')}`).toEqual([]);
  });
});
