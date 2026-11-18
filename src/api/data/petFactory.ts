import { Pet } from '../models/pet';

/**
 * Builds unique, valid pets. The public Petstore is shared by everyone, so ids and names
 * must be unique per run to avoid collisions and false failures. Overrides let each test
 * change only the field it cares about (the "test data builder" pattern).
 */
export function uniquePetId(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

export function buildPet(overrides: Partial<Pet> = {}): Pet {
  const id = overrides.id ?? uniquePetId();
  return {
    id,
    category: { id: 1, name: 'dogs' },
    name: `qa-pet-${id}`,
    photoUrls: ['https://example.com/photo.jpg'],
    tags: [{ id: 1, name: 'automated-test' }],
    status: 'available',
    ...overrides,
  };
}
