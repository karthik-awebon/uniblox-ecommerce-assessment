import { store } from '@/lib/db/store';
import { Cart, Order } from '@/types';
import { discountService } from './DiscountService';

export class CartService {

    /**
     * Adds an item to the cart.
     * * Design Decision: For this In-Memory implementation, we use userId as the cartId
     * to ensure 1:1 mapping between User and Cart without a complex lookup table.
     */
    addToCart(userId: string, productId: string, quantity: number, price: number): Cart {
        const cartId = userId; // Simple mapping for this assessment
        let cart = store.getCart(cartId);

        // 1. Create Cart if it doesn't exist
        if (!cart) {
            cart = {
                id: cartId,
                userId,
                items: [],
            };
        }

        // 2. Update Item Logic
        const existingItemIndex = cart.items.findIndex((i) => i.productId === productId);

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

        // 3. Persist State
        store.saveCart(cart);
        return cart;
    }

    getCart(userId: string): Cart | undefined {
        return store.getCart(userId);
    }

    /**
     * Processes the checkout.
     * 1. Validates Cart
     * 2. Validates & Applies Discount
     * 3. Creates Order (and checks for Nth order reward)
     * 4. Clears Cart
     */
    async checkout(userId: string, discountCode?: string): Promise<{ order: Order; generatedCoupon?: string | undefined }> {
        const cart = this.getCart(userId);

        // Validation: Empty Cart
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart not found or empty');
        }

        // 1. Calculate Subtotal
        const totalAmount = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        let discountPercentage = 0;

        // 2. Validate Discount Code (if provided)
        if (discountCode) {
            // This will throw an error if the code is invalid or used
            discountPercentage = await discountService.validateDiscountCode(discountCode);

            // Mark code as used immediately so it can't be reused in a race condition
            store.markDiscountAsUsed(discountCode);
        }

        // 3. Calculate Financials
        const discountAmount = (totalAmount * discountPercentage) / 100;
        const finalAmount = totalAmount - discountAmount;

        // 4. Create the Order Object
        const newOrder: Order = {
            id: `ORDER-${Date.now()}`,
            userId,
            items: [...cart.items], // Clone items to prevent reference issues
            totalAmount,
            discountCode,
            discountAmount,
            finalAmount,
            timestamp: new Date(),
        };

        // 5. Persist Order & Check for "Nth Order" Reward
        // * The store handles the atomic counter increment *
        const { order: savedOrder, generatedCode } = store.createOrder(newOrder);

        // 6. Clear the User's Cart (Transaction Complete)
        store.saveCart({ ...cart, items: [] });

        return {
            order: savedOrder,
            generatedCoupon: generatedCode
        };
    }
}

export const cartService = new CartService();