import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUserId } from '@/lib/auth';
import { handleApiError } from '@/lib/utils/errorHandler';
import { addToCartSchema } from '@/lib/validators/cart';
import { cartService } from '@/services';

export async function POST(req: NextRequest) {
  try {
    // * Extracts 'x-user-id' header or throws 401
    const userId = getCurrentUserId();

    const body = await req.json();

    // * Security: We force the userId from the Auth Header into the payload.
    // * This prevents Malicious User A from adding items to User B's cart.
    const payload = { ...body, userId };

    // * Throws ZodError if quantity is negative, missing productId, etc.
    const validData = addToCartSchema.parse(payload);

    const updatedCart = cartService.addToCart(
      validData.userId,
      validData.productId,
      validData.quantity,
      validData.price
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    // * Centralized Error Handling (Catches 401, 400, 500 automatically)
    return handleApiError(error);
  }
}
