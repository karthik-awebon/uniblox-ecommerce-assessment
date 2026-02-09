import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/utils/errorHandler';

import { adminService } from '../../../../services/AdminService';

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
