import { z } from 'zod';

/**
 * Validation Schema for "Add to Cart" API
 * POST /api/cart/add
 */
export const addToCartSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z
        .number()
        .int('Quantity must be an integer')
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Cannot add more than 100 items at once'), // Safety limit
    price: z
        .number()
        .positive('Price must be a positive number'),
});

/**
 * Validation Schema for "Checkout" API
 * POST /api/checkout
 */
export const checkoutSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    discountCode: z.string().optional(), // Optional field
});

// Extract the types automatically (DRY principle)
export type AddToCartRequest = z.infer<typeof addToCartSchema>;
export type CheckoutRequest = z.infer<typeof checkoutSchema>;