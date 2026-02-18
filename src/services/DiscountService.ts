import { store } from '@/lib/db/store'; // Access the singleton
import { AppError } from '@/lib/utils/AppError';

export class DiscountService {
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
