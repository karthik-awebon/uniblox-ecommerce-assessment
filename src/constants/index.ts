/**
 * Global Configuration Constants
 */

// 1. The 'n' in "Every nth order"
export const NTH_ORDER_THRESHOLD = Number(
    process.env.NTH_ORDER_THRESHOLD || 5
);

// 2. The 'x' in "x% discount"
export const DISCOUNT_PERCENTAGE = Number(
    process.env.DISCOUNT_PERCENTAGE || 10
);

// Validation check to ensure env vars are loaded correctly on the server
if (typeof window === 'undefined') { // Only run this check on the server
    if (!process.env.NTH_ORDER_THRESHOLD || !process.env.DISCOUNT_PERCENTAGE) {
        console.warn(
            '⚠️ Warning: Discount config is missing in .env. Using defaults (n=5, x=10%).'
        );
    }
}