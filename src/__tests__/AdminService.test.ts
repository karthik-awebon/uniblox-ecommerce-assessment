import { store } from '@/lib/db/store';
import { CartItem, Order } from '@/types';

import { adminService } from '../services/AdminService';

describe('AdminService', () => {
  // 1. Setup: Clear the store before every test
  beforeEach(() => {
    store.reset();
  });

  // Helper to create a dummy order quickly
  const createMockOrder = (
    id: string,
    items: CartItem[],
    totalAmount: number,
    discountAmount: number
  ): Order => ({
    id,
    userId: 'user-1',
    items,
    totalAmount,
    discountAmount,
    finalAmount: totalAmount - discountAmount,
    discountCode: discountAmount > 0 ? 'DISCOUNT-10' : undefined,
    timestamp: new Date(),
  });

  it('should return all zeros when the store is empty', () => {
    const stats = adminService.getStats();

    expect(stats).toEqual({
      totalItemsPurchased: 0,
      totalRevenue: 0,
      totalDiscountsGiven: 0,
      totalDiscountCodes: 0,
    });
  });

  it('should correctly aggregate items, revenue, and discounts from multiple orders', () => {
    // Scenario:
    // Order 1: 2 items, $100, No Discount
    // Order 2: 1 item,  $50,  $5 Discount

    const order1 = createMockOrder(
      'order-1',
      [{ productId: 'p1', quantity: 2, price: 50 }], // 2 items
      100, // Total
      0 // Discount
    );

    const order2 = createMockOrder(
      'order-2',
      [{ productId: 'p2', quantity: 1, price: 50 }], // 1 item
      50, // Total
      5 // Discount
    );

    // Manually inject orders into the store
    store.createOrder(order1);
    store.createOrder(order2);

    // Execute
    const stats = adminService.getStats();

    // Verify
    expect(stats.totalItemsPurchased).toBe(3); // 2 + 1
    expect(stats.totalRevenue).toBe(145); // 100 + (50 - 5)
    expect(stats.totalDiscountsGiven).toBe(5); // 0 + 5
  });

  it('should track the count of generated discount codes', () => {
    // 1. Manually inject discount codes into the store
    store['data'].discountCodes = {
      'CODE-1': { code: 'CODE-1', percentage: 10, isUsed: false },
      'CODE-2': { code: 'CODE-2', percentage: 10, isUsed: true },
    };

    const stats = adminService.getStats();

    expect(stats.totalDiscountCodes).toBe(2);
  });
});
