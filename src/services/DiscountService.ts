import { store } from '@/lib/db/store'; // Access the singleton
import { NTH_ORDER_THRESHOLD } from '@/constants';

export class DiscountService {
    /**
     * Checks if the current order count makes the user eligible for a discount.
     * Logic: "Every nth order gets a coupon code."
     * * Note: In the full flow, Store.createOrder() usually handles the generation atomicity.
     * This method allows us to check eligibility or trigger it manually if needed.
     */
    async checkForDiscount(orderId: string): Promise<string | undefined> {
        const stats = store.getStats();

        // Logic: If total orders is exactly divisible by N, it's a "winning" order.
        // We check > 0 to ensure the 0th order doesn't trigger it.
        if (stats.totalOrders > 0 && stats.totalOrders % NTH_ORDER_THRESHOLD === 0) {
            return `DISCOUNT-${Date.now()}`;
        }

        return undefined;
    }

    /**
     * Validates a discount code and returns the percentage.
     * Throws errors if invalid to stop the checkout flow immediately.
     */
    async validateDiscountCode(code: string): Promise<number> {
        const discount = store.getDiscountCode(code);

        if (!discount) {
            throw new Error('Invalid discount code');
        }

        if (discount.isUsed) {
            throw new Error('Discount code has already been used');
        }

        return discount.percentage;
    }
}

export const discountService = new DiscountService();