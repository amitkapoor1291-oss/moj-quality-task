import { APIRequestContext, APIResponse } from '@playwright/test';
import { Pet, PetStatus } from '../models/pet';

/**
 * Thin client for the /pet endpoints. It deliberately returns the raw APIResponse so tests
 * decide what to assert (status, headers, body). That keeps negative tests easy to write
 * and keeps HTTP details out of the test files.
 */
export class PetClient {
  constructor(private readonly request: APIRequestContext) {}

  create(pet: Pet): Promise<APIResponse> {
    return this.request.post('pet', { data: pet });
  }

  get(id: number | string): Promise<APIResponse> {
    return this.request.get(`pet/${id}`);
  }

  update(pet: Pet): Promise<APIResponse> {
    return this.request.put('pet', { data: pet });
  }

  findByStatus(status: PetStatus | string): Promise<APIResponse> {
    // The public demo returns very large lists for popular statuses, so allow extra time.
    return this.request.get('pet/findByStatus', { params: { status }, timeout: 30_000 });
  }

  delete(id: number | string): Promise<APIResponse> {
    // The api_key header is optional on the demo server but is part of the documented contract.
    return this.request.delete(`pet/${id}`, { headers: { api_key: 'special-key' } });
  }
}
