import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth';
import { cartService } from '@/services/CartService';
import { handleApiError } from '@/lib/utils/errorHandler';

// GET /api/cart
export async function GET() {
  try {
    const userId = getCurrentUserId();
    const cart = cartService.getCart(userId);

    // Return empty cart structure if none exists yet
    if (!cart) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    return handleApiError(error);
  }
}
