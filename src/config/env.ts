/**
 * Single place for environment-driven settings, so tests never hard-code URLs
 * or credentials and the same suite can run against a local mock or a real environment.
 */
const withTrailingSlash = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

export const config = {
  // Trailing slash matters: Playwright resolves relative request paths (e.g. 'pet/1') against it.
  petstoreBaseUrl: withTrailingSlash(process.env.PETSTORE_BASE_URL ?? 'https://petstore.swagger.io/v2/'),
  orangeHrmBaseUrl: process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
  // Public demo credentials shown on the OrangeHRM demo login page.
  orangeHrmUsername: process.env.ORANGEHRM_USERNAME ?? 'Admin',
  orangeHrmPassword: process.env.ORANGEHRM_PASSWORD ?? 'admin123',
};
