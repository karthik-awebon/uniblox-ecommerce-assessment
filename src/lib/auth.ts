import { headers } from 'next/headers';

import { AppError } from '@/lib/utils/AppError';

/**
 * Extracts and validates the User ID from the request headers.
 * * Simulates a protected route middleware.
 * * @throws {AppError} 401 - If the header is missing or empty.
 * @returns {string} The authenticated User ID.
 */
export function getCurrentUserId(): string {
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  // Guard Clause: Authentication Barrier
  if (!userId || userId.trim() === '') {
    throw new AppError('Unauthorized: Missing x-user-id header', 401);
  }

  return userId;
}
