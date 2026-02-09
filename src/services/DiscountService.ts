import { AppError } from '@/lib/utils/AppError';
import { store } from '@/lib/db/store'; // Access the singleton
import { NTH_ORDER_THRESHOLD } from '@/constants';

export class DiscountService {
  /**
   * Checks if the current global order count meets the threshold for a reward.
   * * @remarks
   * LOGIC: If (TotalOrders % N) === 0, generate a new code.
   * This is called *after* an order is successfully placed.
   * * @param orderId - The ID of the order that just completed (used for auditing/logging).
   * @returns A new discount code string if eligible, otherwise undefined.
   */
  async checkForDiscount(orderId: string): Promise<string | undefined> {
    const stats = store.getStats();

    // Logic: If total orders is exactly divisible by N, it's a "winning" order.
    // We check > 0 to ensure the 0th order doesn't trigger it.
    if (
      stats.totalOrders > 0 &&
      stats.totalOrders % NTH_ORDER_THRESHOLD === 0
    ) {
      console.log(`Order ${orderId} triggered a discount.`);
      return `DISCOUNT-${Date.now()}`;
    }

    return undefined;
  }

  /**
   * Validates if a discount code exists and has not been used.
   * * @param code - The code string to check.
   * @returns True if valid and unused, False otherwise.
   */
  async validateDiscountCode(code: string): Promise<number> {
    const discount = store.getDiscountCode(code);

    if (!discount) {
      throw new AppError('Invalid discount code', 400);
    }

    if (discount.isUsed) {
      throw new AppError('Discount code has already been used', 400);
    }

    return discount.percentage;
  }
}

export const discountService = new DiscountService();
