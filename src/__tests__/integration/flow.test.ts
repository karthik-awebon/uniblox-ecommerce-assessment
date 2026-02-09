/**
 * @jest-environment node
 */
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

import { POST as addToCartAPI } from '@/app/api/cart/add/route';
import { POST as checkoutAPI } from '@/app/api/checkout/route';
import { store } from '@/lib/db/store';

// 1. Mock Configuration: Every 2nd order wins (Fast testing)
jest.mock('@/constants', () => ({
  NTH_ORDER_THRESHOLD: 2,
  DISCOUNT_PERCENTAGE: 10, // 10% off
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

describe('E2E Integration: The "Golden Path" User Journey', () => {
  beforeEach(() => {
    store.reset();
    (headers as jest.Mock).mockClear();
  });

  // Helper to simulate an API Client (like Postman/Supertest)
  const client = {
    post: async (
      url: string,
      body: Record<string, unknown>,
      userId: string
    ) => {
      // Spy on the headers function
      (headers as jest.Mock).mockReturnValue(new Map([['x-user-id', userId]]));

      // Create a real NextRequest
      const req = new NextRequest(`http://localhost:3000${url}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'x-user-id': userId },
      });

      // Route the request to the correct handler
      if (url === '/api/cart/add') return addToCartAPI(req);
      if (url === '/api/checkout') return checkoutAPI(req);
      throw new Error('Unknown Route');
    },
  };

  it('should handle the full lifecycle: Add -> Checkout -> Win Discount -> Use Discount', async () => {
    // ====================================================
    // 👤 USER A (Order #1) - No Luck
    // ====================================================
    // 1. Add to Cart
    await client.post(
      '/api/cart/add',
      { productId: 'p1', quantity: 1, price: 100 },
      'user-A'
    );

    // 2. Checkout
    const resA = await client.post('/api/checkout', {}, 'user-A');
    const jsonA = await resA.json();

    expect(resA.status).toBe(201);
    expect(jsonA.data.generatedCoupon).toBeUndefined(); // 1st order, no coupon
    expect(store.getStats().totalOrders).toBe(1);

    // ====================================================
    // 👤 USER B (Order #2) - THE WINNER! (N=2)
    // ====================================================
    // 1. Add to Cart
    await client.post(
      '/api/cart/add',
      { productId: 'p1', quantity: 1, price: 100 },
      'user-B'
    );

    // 2. Checkout
    const resB = await client.post('/api/checkout', {}, 'user-B');
    const jsonB = await resB.json();

    expect(resB.status).toBe(201);
    expect(jsonB.data.generatedCoupon).toBeDefined(); // Winner!

    const winningCode = jsonB.data.generatedCoupon;
    console.log(`    > User B won coupon: ${winningCode}`);

    // ====================================================
    // 👤 USER B (Order #3) - REDEEMING THE PRIZE
    // ====================================================
    // 1. Add items worth $200
    await client.post(
      '/api/cart/add',
      { productId: 'p2', quantity: 2, price: 100 },
      'user-B'
    );

    // 2. Checkout WITH the code
    const resRedeem = await client.post(
      '/api/checkout',
      { discountCode: winningCode },
      'user-B'
    );
    const jsonRedeem = await resRedeem.json();
    const order = jsonRedeem.data.order;

    // 3. Verify Math
    expect(resRedeem.status).toBe(201);
    expect(order.totalAmount).toBe(200); // 2 * 100
    expect(order.discountAmount).toBe(20); // 10% of 200
    expect(order.finalAmount).toBe(180); // 200 - 20
    expect(order.discountCode).toBe(winningCode);

    // 4. Verify Code is Burned (Cannot be used again)
    // We need to add something to the cart again because checkout clears it.
    await client.post(
      '/api/cart/add',
      { productId: 'p3', quantity: 1, price: 50 },
      'user-B'
    );
    const resReplay = await client.post(
      '/api/checkout',
      { discountCode: winningCode },
      'user-B'
    );
    expect(resReplay.status).toBe(400); // Should fail validation
  });
});
