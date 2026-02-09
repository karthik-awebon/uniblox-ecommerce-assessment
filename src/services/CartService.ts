import { AppError } from '@/lib/utils/AppError';
import { store } from '@/lib/db/store';
import { Cart, Order } from '@/types';
import { discountService } from './DiscountService';
import { randomUUID } from 'crypto';

export class CartService {
  /**
   * Adds an item to the cart or updates its quantity if it already exists.
   * * @remarks
   * This method handles the "Upsert" logic:
   * 1. If cart doesn't exist, create it.
   * 2. If item exists, increment quantity.
   * 3. If item is new, push to array.
   * * @param userId - Owner of the cart.
   * @param productId - ID of the item to add.
   * @param quantity - Amount to add (must be > 0).
   * @param price - Unit price at the time of addition.
   * @returns The updated Cart object.
   */
  addToCart(
    userId: string,
    productId: string,
    quantity: number,
    price: number
  ): Cart {
    const cartId = userId; // Simple mapping for this assessment
    let cart = store.getCart(cartId);

    if (!cart) {
      cart = {
        id: `cart-${randomUUID()}`,
        userId,
        items: [],
      };
    }

    const existingItemIndex = cart.items.findIndex(
      (i) => i.productId === productId
    );

    if (existingItemIndex > -1 && cart.items[existingItemIndex]) {
      // Item exists: Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Item is new: Push to array
      cart.items.push({
        productId,
        quantity,
        price,
      });
    }

    store.saveCart(cart);
    return cart;
  }

  /**
   * Retrieves the current state of a user's cart.
   * If no cart exists in memory, returns undefined (handled by controller).
   * * @param userId - The unique identifier from x-user-id header.
   */
  getCart(userId: string): Cart | undefined {
    return store.getCart(userId);
  }

  /**
   * Converts a Cart into a permanent Order.
   * * @remarks
   * This is a transactional operation that:
   * 1. Validates the cart is not empty.
   * 2. Validates and applies the Discount Code (if provided).
   * 3. Checks if this order triggers the "N-th Order Reward".
   * 4. Clears the user's cart from memory after success.
   * * @param userId - The user performing checkout.
   * @param discountCode - (Optional) Coupon code to apply.
   * @returns An object containing the created Order and any *newly generated* coupon.
   * @throws {AppError} 404 if cart is empty or not found.
   * @throws {AppError} 400 if discount code is invalid.
   */
  async checkout(
    userId: string,
    discountCode?: string
  ): Promise<{ order: Order; generatedCoupon?: string | undefined }> {
    const cart = this.getCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart not found or empty', 404);
    }

    // 1. Calculate base totals
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let discountPercentage = 0;

    // 2. Validate & Apply Discount (if provided)
    if (discountCode) {
      // This will throw an error if the code is invalid or used
      discountPercentage =
        await discountService.validateDiscountCode(discountCode);

      // Mark code as used immediately so it can't be reused in a race condition
      store.markDiscountAsUsed(discountCode);
    }

    const discountAmount = (totalAmount * discountPercentage) / 100;
    const finalAmount = totalAmount - discountAmount;

    // 3. Create the Order Object
    const newOrder: Order = {
      id: `ORDER-${randomUUID()}`,
      userId,
      items: [...cart.items],
      totalAmount,
      discountCode,
      discountAmount,
      finalAmount,
      timestamp: new Date(),
    };

    // * The store handles the atomic counter increment *
    const { order: savedOrder, generatedCode } = store.createOrder(newOrder);

    // 4. Save Order
    store.saveCart({ ...cart, items: [] });

    return {
      order: savedOrder,
      generatedCoupon: generatedCode,
    };
  }
}

export const cartService = new CartService();
