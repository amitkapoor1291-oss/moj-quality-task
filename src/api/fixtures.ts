import { test as base } from '@playwright/test';
import { PetClient } from './clients/petClient';

type ApiFixtures = {
  petClient: PetClient;
  /** Register a pet id so it is deleted after the test, even if the test fails. */
  trackPet: (id: number) => void;
};

export const test = base.extend<ApiFixtures>({
  petClient: async ({ request }, use) => {
    await use(new PetClient(request));
  },

  trackPet: async ({ petClient }, use) => {
    const ids: number[] = [];
    await use((id) => ids.push(id));
    // Teardown: leave the shared environment as we found it. Ignore 404 (already deleted).
    for (const id of ids) {
      await petClient.delete(id);
    }
  },
});

export { expect } from '@playwright/test';
