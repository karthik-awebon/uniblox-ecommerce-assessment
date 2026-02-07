import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validators/cart';
import { cartService } from '@/services';
import { handleApiError } from '@/lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  try {
    // * Extracts 'x-user-id' header or throws 401
    const userId = getCurrentUserId();

    // * We default to {} because a user might checkout without a discount code
    // * and sending an empty body shouldn't crash the server.
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Ignore JSON parse error; treat as empty body
    }

    // * We override the body's userId with the trusted header userId
    const payload = { ...body, userId };
    const validData = checkoutSchema.parse(payload);

    // * This performs: Cart Validation -> Discount Validation -> Order Creation -> DB Save
    const result = await cartService.checkout(
      validData.userId,
      validData.discountCode
    );

    // * Status 201 (Created) is semantically correct for creating an Order
    return NextResponse.json(
      {
        success: true,
        data: result, // Contains { order, generatedCoupon }
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
