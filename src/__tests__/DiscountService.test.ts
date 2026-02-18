import { store } from '@/lib/db/store';

import { discountService } from '../services/DiscountService';

// Mock config: Every 3rd order gets a discount
jest.mock('@/constants', () => ({
  NTH_ORDER_THRESHOLD: 3,
  DISCOUNT_PERCENTAGE: 10,
}));

describe('DiscountService (TDD)', () => {
  // Clear DB before each test
  beforeEach(() => {
    store.reset();
  });

  describe('validateDiscountCode', () => {
    it('should return 10% for a valid, unused code', async () => {
      // Setup: Manually inject a code into the store
      const validCode = 'TEST-CODE-10';
      store['data'].discountCodes[validCode] = {
        code: validCode,
        percentage: 10,
        isUsed: false,
      };

      const percentage = await discountService.validateDiscountCode(validCode);
      expect(percentage).toBe(10);
    });

    it('should throw an error if the code is invalid', async () => {
      await expect(
        discountService.validateDiscountCode('INVALID-CODE')
      ).rejects.toThrow('Invalid discount code');
    });

    it('should throw an error if the code has already been used', async () => {
      // Setup: Inject a USED code
      const usedCode = 'USED-CODE-10';
      store['data'].discountCodes[usedCode] = {
        code: usedCode,
        percentage: 10,
        isUsed: true, // <--- Key test case
      };

      await expect(
        discountService.validateDiscountCode(usedCode)
      ).rejects.toThrow('Discount code has already been used');
    });
  });
});
