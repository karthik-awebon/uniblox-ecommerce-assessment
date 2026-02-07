import { discountService } from '../services/DiscountService';
import { store } from '@/lib/db/store';

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

    describe('checkForDiscount (N-th Order Logic)', () => {
        it('should NOT generate a code for the 1st and 2nd orders', async () => {
            // Mock Data: We assume orders are created sequentially
            // Note: We are testing the service logic, which relies on the Store's count

            // Simulate 1st order
            // (In real implementation, createOrder increments the count)
            store['data'].orderCount = 1;
            const code1 = await discountService.checkForDiscount('order-1');
            expect(code1).toBeUndefined();

            // Simulate 2nd order
            store['data'].orderCount = 2;
            const code2 = await discountService.checkForDiscount('order-2');
            expect(code2).toBeUndefined();
        });

        it('should generate a discount code for the 3rd order (nth)', async () => {
            // Simulate 3rd order
            store['data'].orderCount = 3;

            const code = await discountService.checkForDiscount('order-3');

            expect(code).toBeDefined();
            expect(typeof code).toBe('string');
            expect(code).toContain('DISCOUNT-');
        });
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