import { NextResponse } from 'next/server';
import { adminService } from '../../../../services/AdminService';
import { handleApiError } from '@/lib/utils/errorHandler';

export async function GET() {
  try {
    const stats = adminService.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
