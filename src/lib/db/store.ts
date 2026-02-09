import { Cart, Order, DiscountCode, InMemoryStore } from '@/types';
import { NTH_ORDER_THRESHOLD, DISCOUNT_PERCENTAGE } from '@/constants';

class Store {
  private static instance: Store;

  private data: InMemoryStore = {
    carts: {},
    orders: [],
    discountCodes: {},
    orderCount: 0,
    n: NTH_ORDER_THRESHOLD,
    x: DISCOUNT_PERCENTAGE,
  };

  // Prevent direct construction
  private constructor() {}

  /**
   * Get the Singleton instance of the Store.
   * Ensures only one instance exists throughout the app lifecycle.
   */
  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  // --- CART OPERATIONS ---

  /**
   * Retrieves a cart by its ID.
   * @param cartId - The ID of the cart to retrieve.
   * @returns The cart object, or undefined if not found.
   */
  public getCart(cartId: string): Cart | undefined {
    return this.data.carts[cartId];
  }

  /**
   * Saves a cart to the store.
   * @param cart - The cart object to save.
   */
  public saveCart(cart: Cart): void {
    this.data.carts[cart.userId] = cart;
  }

  // --- ORDER OPERATIONS ---

  /**
   * Atomically creates an order and checks for discount generation.
   * This mimics a "Transaction" in a real DB.
   * @param order - The order to create.
   * @returns An object containing the created order and a generated discount code (if applicable).
   */
  public createOrder(order: Order): {
    order: Order;
    generatedCode?: string | undefined;
  } {
    this.data.orders.push(order);
    this.data.orderCount++;

    let generatedCode: string | undefined;

    if (this.data.orderCount % this.data.n === 0) {
      // Logic: Every n-th order generates a discount code
      generatedCode = this.generateDiscountCode();
    }

    return { order, generatedCode };
  }

  /**
   * Retrieves all orders from the store.
   * @returns An array of all orders.
   */
  public getOrders(): Order[] {
    return this.data.orders;
  }

  // --- DISCOUNT OPERATIONS ---

  /**
   * Retrieves a discount code by its code string.
   * @param code - The discount code string.
   * @returns The discount code object, or undefined if not found.
   */
  public getDiscountCode(code: string): DiscountCode | undefined {
    return this.data.discountCodes[code];
  }

  /**
   * Creates a new discount code.
   * @param code - The discount code string.
   * @param percentage - The discount percentage.
   */
  public createDiscountCode(code: string, percentage: number): void {
    this.data.discountCodes[code] = {
      code,
      percentage,
      isUsed: false,
    };
  }

  /**
   * Marks a discount code as used.
   * @param code - The discount code string to mark as used.
   */
  public markDiscountAsUsed(code: string): void {
    if (this.data.discountCodes[code]) {
      this.data.discountCodes[code].isUsed = true;
    }
  }

  /**
   * Helper to generate a unique code and save it.
   * @returns The generated discount code string.
   */
  private generateDiscountCode(): string {
    const code = `DISCOUNT-${Date.now()}`; // Simple unique code
    this.data.discountCodes[code] = {
      code,
      percentage: this.data.x,
      isUsed: false,
    };
    return code;
  }

  // --- ADMIN / DEBUG OPERATIONS ---

  /**
   * Retrieves statistics about the store.
   * @returns An object containing store statistics.
   */
  public getStats() {
    return {
      totalOrders: this.data.orderCount,
      totalRevenue: this.data.orders.reduce((acc, o) => acc + o.finalAmount, 0),
      discountCodesSize: Object.keys(this.data.discountCodes).length,
    };
  }

  /**
   * Clears the store (Useful for Unit Tests)
   */
  public reset(): void {
    this.data = {
      carts: {},
      orders: [],
      discountCodes: {},
      orderCount: 0,
      n: NTH_ORDER_THRESHOLD,
      x: DISCOUNT_PERCENTAGE,
    };
  }
}

// Export the singleton instance
const globalForStore = global as unknown as { store: Store };

export const store = globalForStore.store || Store.getInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForStore.store = store;
}
