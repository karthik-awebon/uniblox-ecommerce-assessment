/**
 * @jest-environment node
 */
import { POST } from '@/app/api/cart/add/route';
import { NextRequest } from 'next/server';
import { store } from '@/lib/db/store';

// Helper to create a mock request with headers
function createRequest(
  method: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  return new NextRequest('http://localhost:3000/api/cart/add', {
    method,
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

import { headers } from 'next/headers';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

describe('API: POST /api/cart/add', () => {
  // Clear the DB before every test to ensure isolation
  beforeEach(() => {
    store.reset();
    (headers as jest.Mock).mockClear();
  });

  it('should return 401 if x-user-id header is missing', async () => {
    // 1. Mock headers() to return a Map-like object without the user ID
    (headers as jest.Mock).mockReturnValue(new Headers());

    // 2. Create request WITHOUT headers
    const req = createRequest('POST', { productId: 'p1', quantity: 1 });

    // 3. Call the route handler
    const res = await POST(req);
    const json = await res.json();

    // 4. Verify
    expect(res.status).toBe(401);
    expect(json.error).toContain('Unauthorized');
  });

  it('should return 400 if validation fails (Zod)', async () => {
    // 1. Mock a valid user ID
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );

    // 2. Create request with INVALID body (negative quantity)
    const req = createRequest(
      'POST',
      { productId: 'p1', quantity: -5, price: 100 },
      { 'x-user-id': 'user-123' }
    );

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Validation Failed');
    // Zod error details should be present
    expect(json.details[0]).toContain('Quantity must be at least 1');
  });

  it('should return 200 and the updated cart on success', async () => {
    // 1. Mock a valid user ID
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );

    // 2. Create valid request
    const req = createRequest(
      'POST',
      { productId: 'prod-99', quantity: 2, price: 50 },
      { 'x-user-id': 'user-123' }
    );

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.userId).toBe('user-123');
    expect(json.data.items[0].productId).toBe('prod-99');
  });
});
