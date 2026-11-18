import { test, expect } from '../../src/api/fixtures';
import { buildPet } from '../../src/api/data/petFactory';
import { ApiError, Pet } from '../../src/api/models/pet';

/**
 * Endpoint family under test: /pet (create, update, read by id, find by status, delete).
 *
 * The scenarios target things a simple "create then read" check would miss:
 *   1. every read path agrees after a change (consistency),
 *   2. conflicting writes at the same moment never produce a half-and-half record (integrity),
 *   3. invalid input gets a client error, never a server error (negative: invalid input),
 *   4. a deleted pet is really gone and the error is meaningful (negative: error handling).
 * Further scenarios, in priority order, are in docs/TEST_DESIGN.md.
 */
test.describe('Petstore API: /pet', () => {
  test('a status change is reflected consistently by GET by id and by find-by-status', async ({ petClient, trackPet }) => {
    test.setTimeout(90_000);
    const pet = buildPet({ status: 'available' });
    trackPet(pet.id);

    await test.step('arrange: create an available pet', async () => {
      expect((await petClient.create(pet)).status()).toBe(200);
    });

    await test.step('act: mark the pet as sold', async () => {
      const response = await petClient.update({ ...pet, status: 'sold' });
      expect(response.status()).toBe(200);
    });

    await test.step('assert: GET by id says sold', async () => {
      await expect(async () => {
        const body = (await (await petClient.get(pet.id)).json()) as Pet;
        expect(body.status).toBe('sold');
      }).toPass({ timeout: 15_000 });
    });

    await test.step('assert: find-by-status "sold" includes it and "available" no longer does', async () => {
      await expect(async () => {
        const sold = (await (await petClient.findByStatus('sold')).json()) as Pet[];
        const available = (await (await petClient.findByStatus('available')).json()) as Pet[];
        expect(sold.map((p) => p.id)).toContain(pet.id);
        expect(available.map((p) => p.id)).not.toContain(pet.id);
      }).toPass({ timeout: 45_000 });
    });
  });

  test('two conflicting updates at the same moment leave one complete record, never a mix', async ({ petClient, trackPet }) => {
    const pet = buildPet();
    trackPet(pet.id);
    expect((await petClient.create(pet)).status()).toBe(200);

    const writeA: Pet = { ...pet, name: `${pet.name}-A`, status: 'sold' };
    const writeB: Pet = { ...pet, name: `${pet.name}-B`, status: 'pending' };

    await test.step('act: send both updates in parallel', async () => {
      const [a, b] = await Promise.all([petClient.update(writeA), petClient.update(writeB)]);
      expect(a.status()).toBe(200);
      expect(b.status()).toBe(200);
    });

    await test.step('assert: the stored pet is exactly write A or exactly write B (name and status from the same write)', async () => {
      await expect(async () => {
        const body = (await (await petClient.get(pet.id)).json()) as Pet;
        expect([`${writeA.name}|${writeA.status}`, `${writeB.name}|${writeB.status}`]).toContain(`${body.name}|${body.status}`);
      }).toPass({ timeout: 15_000 });
    });
  });

  for (const badId of ['abc', '1.5.2']) {
    test(`GET /pet/${badId} (invalid id) is rejected with a client error, never a server error`, async ({ petClient }) => {
      const response = await petClient.get(badId);
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  }

  test('GET /pet/{id} for a deleted pet returns 404 with an error body', async ({ petClient, trackPet }) => {
    const pet = buildPet();
    trackPet(pet.id);

    await test.step('arrange: create then delete the pet so we know the id no longer exists', async () => {
      expect((await petClient.create(pet)).status()).toBe(200);
      expect((await petClient.delete(pet.id)).status()).toBe(200);
    });

    await test.step('act and assert: the pet is gone and the error is meaningful', async () => {
      await expect(async () => {
        const response = await petClient.get(pet.id);
        expect(response.status()).toBe(404);
        const error = (await response.json()) as ApiError;
        expect(error.type).toBe('error');
        expect(error.message).toBe('Pet not found');
      }).toPass({ timeout: 10_000 });
    });
  });
});
