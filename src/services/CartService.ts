import { store } from '@/lib/db/store';
import { Cart, Order, CartItem } from '@/types';
import { discountService } from './DiscountService';

export class CartService {
    /**
     * Adds an item to a user's cart.
     * If cart doesn't exist, creates one.
     * If item exists, updates quantity.
     */
    addToCart(userId: string, productId: string, quantity: number, price: number): Cart {
        throw new Error('Method not implemented.');
    }

    /**
     * Retrieves a cart by User ID.
     */
    getCart(userId: string): Cart | undefined {
        throw new Error('Method not implemented.');
    }

    /**
     * Finalizes the order.
     * 1. Validates discount code (if any).
     * 2. Calculates totals.
     * 3. Persists order to Store.
     * 4. Returns the Order and any generated coupon.
     */
    async checkout(userId: string, discountCode?: string): Promise<{ order: Order; generatedCoupon?: string }> {
        throw new Error('Method not implemented.');
    }
}

export const cartService = new CartService();