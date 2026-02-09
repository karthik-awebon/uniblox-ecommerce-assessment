/**
 * @jest-environment node
 */
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/checkout/route';
import { store } from '@/lib/db/store';

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

// Helper to create a mock request with headers
function createRequest(
  method: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  return new NextRequest('http://localhost:3000/api/checkout', {
    method,
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

describe('API: POST /api/checkout', () => {
  beforeEach(() => {
    store.reset();
    (headers as jest.Mock).mockClear();
  });

  it('should return 401 if x-user-id header is missing', async () => {
    (headers as jest.Mock).mockReturnValue(new Headers());
    const req = createRequest('POST', {});
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toContain('Unauthorized');
  });

  it('should return 404 if the cart is empty', async () => {
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );
    const req = createRequest('POST', {}, { 'x-user-id': 'user-123' });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error).toBe('Cart not found or empty');
  });

  it('should return 201 and apply a valid discount code', async () => {
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );
    store.saveCart({
      id: 'user-123',
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    });
    store.createDiscountCode('VALIDCODE', 10);
    const req = createRequest(
      'POST',
      { discountCode: 'VALIDCODE' },
      { 'x-user-id': 'user-123' }
    );
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.order.totalAmount).toBe(100);
    expect(json.data.order.discountAmount).toBe(10);
    expect(json.data.order.finalAmount).toBe(90);
  });

  it('should return 400 for an invalid discount code', async () => {
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );
    store.saveCart({
      id: 'user-123',
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    });
    const req = createRequest(
      'POST',
      { discountCode: 'INVALID' },
      { 'x-user-id': 'user-123' }
    );
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Invalid discount code');
  });

  it('should return 400 for a used discount code', async () => {
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );
    store.saveCart({
      id: 'user-123',
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    });
    store.createDiscountCode('USEDCODE', 10);
    store.markDiscountAsUsed('USEDCODE');
    const req = createRequest(
      'POST',
      { discountCode: 'USEDCODE' },
      { 'x-user-id': 'user-123' }
    );
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Discount code has already been used');
  });

  it('should return 201 for a successful checkout without a discount', async () => {
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );
    store.saveCart({
      id: 'user-123',
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    });
    const req = createRequest('POST', {}, { 'x-user-id': 'user-123' });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.order.finalAmount).toBe(100);
    expect(json.data.generatedCoupon).toBeUndefined();
  });

  it('should return a generated coupon on the Nth order', async () => {
    (headers as jest.Mock).mockReturnValue(
      new Headers({ 'x-user-id': 'user-123' })
    );
    // Simulate previous orders
    for (let i = 0; i < 9; i++) {
      store.createOrder({
        id: `order-${i}`,
        userId: `user-${i}`,
        items: [],
        totalAmount: 1,
        discountAmount: 0,
        finalAmount: 1,
        timestamp: new Date(),
      });
    }
    store.saveCart({
      id: 'user-123',
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    });
    const req = createRequest('POST', {}, { 'x-user-id': 'user-123' });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.generatedCoupon).toBeDefined();
    expect(json.data.generatedCoupon).toContain('DISCOUNT-');
  });
});
