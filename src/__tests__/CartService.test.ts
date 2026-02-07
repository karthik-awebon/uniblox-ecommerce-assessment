import { cartService } from '../services/CartService';
import { store } from '@/lib/db/store';

// Mock Constants to control the "Nth order" logic
jest.mock('@/constants', () => ({
  NTH_ORDER_THRESHOLD: 2, // Every 2nd order gets a discount
  DISCOUNT_PERCENTAGE: 10,
}));

describe('CartService (TDD)', () => {
  // Reset DB before every test
  beforeEach(() => {
    store.reset();
  });

  describe('addToCart', () => {
    it('should create a new cart if one does not exist', () => {
      const cart = cartService.addToCart('user-1', 'prod-1', 2, 100);

      expect(cart).toBeDefined();
      expect(cart.userId).toBe('user-1');
      expect(cart.items.length).toBe(1);
      expect(cart.items[0]).toEqual({
        productId: 'prod-1',
        quantity: 2,
        price: 100,
      });
    });

    it('should update quantity if item already exists in cart', () => {
      // 1. Add initial item
      cartService.addToCart('user-1', 'prod-1', 1, 100);

      // 2. Add same item again
      const updatedCart = cartService.addToCart('user-1', 'prod-1', 2, 100);

      expect(updatedCart.items.length).toBe(1); // Still 1 unique item
      expect(updatedCart.items[0]?.quantity).toBe(3); // 1 + 2 = 3
    });
  });

  describe('checkout', () => {
    it('should throw error if cart is empty or missing', async () => {
      await expect(cartService.checkout('ghost-user')).rejects.toThrow(
        'Cart not found or empty'
      );
    });

    it('should calculate correct total without discount', async () => {
      // Setup: Add items worth 300 (2 * 100 + 1 * 100)
      cartService.addToCart('user-1', 'prod-A', 2, 100);
      cartService.addToCart('user-1', 'prod-B', 1, 100);

      const { order } = await cartService.checkout('user-1');

      expect(order.totalAmount).toBe(300);
      expect(order.discountAmount).toBe(0);
      expect(order.finalAmount).toBe(300);
    });

    it('should apply a valid discount code', async () => {
      // Setup: Create a valid code in store
      const code = 'VALID-10';
      store['data'].discountCodes[code] = {
        code,
        percentage: 10, // 10% off
        isUsed: false,
      };

      // Setup: Cart worth 200
      cartService.addToCart('user-2', 'prod-A', 2, 100);

      const { order } = await cartService.checkout('user-2', code);

      expect(order.totalAmount).toBe(200);
      expect(order.discountAmount).toBe(20); // 10% of 200
      expect(order.finalAmount).toBe(180); // 200 - 20
      expect(order.discountCode).toBe(code);
    });

    it('should generate a NEW discount coupon on the Nth order', async () => {
      // Setup: NTH_ORDER_THRESHOLD is mocked to 2

      // 1. First Order (No Coupon)
      cartService.addToCart('user-A', 'item', 1, 100);
      const res1 = await cartService.checkout('user-A');
      expect(res1.generatedCoupon).toBeUndefined();

      // 2. Second Order (The Nth Order!)
      cartService.addToCart('user-B', 'item', 1, 100);
      const res2 = await cartService.checkout('user-B');

      expect(res2.generatedCoupon).toBeDefined();
      expect(res2.generatedCoupon).toContain('DISCOUNT-');
    });
  });
});
