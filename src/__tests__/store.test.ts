import { store } from '@/lib/db/store';
import { Cart, Order } from '@/types';
import { NTH_ORDER_THRESHOLD, DISCOUNT_PERCENTAGE } from '@/constants';

describe('Store', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('Singleton Pattern', () => {
    it('should always return the same instance', () => {
      const instance1 = store;
      const instance2 = store;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Cart Operations', () => {
    it('should save and retrieve a cart', () => {
      const cart: Cart = {
        id: 'cart1',
        items: [{ productId: 'p1', quantity: 1, price: 100 }],
        userId: '1234',
      };
      store.saveCart(cart);
      const retrievedCart = store.getCart('1234');
      expect(retrievedCart).toEqual(cart);
    });

    it('should return undefined for a non-existent cart', () => {
      const retrievedCart = store.getCart('non-existent-cart');
      expect(retrievedCart).toBeUndefined();
    });
  });

  describe('Order Operations', () => {
    it('should create an order and not generate a discount code', () => {
      const order: Order = {
        id: 'order1',
        userId: 'user1',
        items: [{ productId: 'p1', quantity: 1, price: 100 }],
        totalAmount: 100,
        discountAmount: 0,
        finalAmount: 100,
        timestamp: new Date(),
      };
      const { order: createdOrder, generatedCode } = store.createOrder(order);

      expect(createdOrder).toEqual(order);
      expect(store.getOrders()).toContainEqual(order);
      expect(generatedCode).toBeUndefined();
    });

    it('should generate a discount code on the Nth order', () => {
      for (let i = 1; i < NTH_ORDER_THRESHOLD; i++) {
        const order: Order = {
          id: `order${i}`,
          userId: 'user1',
          items: [],
          totalAmount: 100,
          discountAmount: 0,
          finalAmount: 100,
          timestamp: new Date(),
        };
        store.createOrder(order);
      }

      const nthOrder: Order = {
        id: `order${NTH_ORDER_THRESHOLD}`,
        userId: 'user1',
        items: [],
        totalAmount: 100,
        discountAmount: 0,
        finalAmount: 100,
        timestamp: new Date(),
      };
      const { order: createdOrder, generatedCode } =
        store.createOrder(nthOrder);

      expect(createdOrder).toEqual(nthOrder);
      expect(generatedCode).toBeDefined();
      expect(typeof generatedCode).toBe('string');

      const discount = store.getDiscountCode(generatedCode!);
      expect(discount).toBeDefined();
      expect(discount?.code).toBe(generatedCode);
      expect(discount?.percentage).toBe(DISCOUNT_PERCENTAGE);
      expect(discount?.isUsed).toBe(false);
    });
  });

  describe('Discount Operations', () => {
    let generatedCode: string;

    beforeEach(() => {
      for (let i = 1; i <= NTH_ORDER_THRESHOLD; i++) {
        const order: Order = {
          id: `order${i}`,
          userId: 'user1',
          items: [],
          totalAmount: 100,
          discountAmount: 0,
          finalAmount: 100,
          timestamp: new Date(),
        };
        const result = store.createOrder(order);
        if (result.generatedCode) {
          generatedCode = result.generatedCode;
        }
      }
    });

    it('should retrieve a discount code', () => {
      const discount = store.getDiscountCode(generatedCode);
      expect(discount).toBeDefined();
      expect(discount?.code).toBe(generatedCode);
    });

    it('should return undefined for a non-existent discount code', () => {
      const discount = store.getDiscountCode('non-existent-code');
      expect(discount).toBeUndefined();
    });

    it('should mark a discount code as used', () => {
      store.markDiscountAsUsed(generatedCode);
      const discount = store.getDiscountCode(generatedCode);
      expect(discount?.isUsed).toBe(true);
    });

    it('should not throw when marking a non-existent code as used', () => {
      expect(() => store.markDiscountAsUsed('non-existent-code')).not.toThrow();
    });
  });

  describe('Admin / Debug Operations', () => {
    it('should return correct stats', () => {
      store.createOrder({
        id: 'order1',
        userId: 'user1',
        items: [],
        totalAmount: 100,
        discountAmount: 0,
        finalAmount: 100,
        timestamp: new Date(),
      });
      store.createOrder({
        id: 'order2',
        userId: 'user1',
        items: [],
        totalAmount: 150,
        discountAmount: 0,
        finalAmount: 150,
        timestamp: new Date(),
      });

      const stats = store.getStats();

      expect(stats.totalOrders).toBe(2);
      expect(stats.totalRevenue).toBe(250);
      expect(stats.discountCodesSize).toBe(0);
    });

    it('should reset the store to its initial state', () => {
      store.saveCart({ id: 'cart1', items: [], userId: 'user1' });
      store.createOrder({
        id: 'order1',
        userId: 'user1',
        items: [],
        totalAmount: 100,
        discountAmount: 0,
        finalAmount: 100,
        timestamp: new Date(),
      });
      store.reset();

      expect(store.getCart('cart1')).toBeUndefined();
      expect(store.getOrders()).toHaveLength(0);
      const stats = store.getStats();
      expect(stats.totalOrders).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.discountCodesSize).toBe(0);
    });
  });
});
