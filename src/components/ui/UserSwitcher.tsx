'use client';

import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils/cn';

const AVAILABLE_USERS = ['user-123', 'user-456', 'user-789', 'test-admin'];

export default function UserSwitcher() {
  const { userId, setUserId, isLoading } = useUser();

  if (isLoading)
    return <div className="text-sm text-gray-500">Loading User...</div>;

  return (
    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 p-2">
      <span className="text-xs font-semibold uppercase text-gray-500">
        Current User:
      </span>
      <select
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className={cn(
          'cursor-pointer bg-transparent text-sm font-medium text-gray-900 focus:outline-none',
          'transition-colors hover:text-blue-600'
        )}
      >
        {/* Option 1: The current custom ID (if not in list) */}
        {!AVAILABLE_USERS.includes(userId) && (
          <option value={userId}>{userId} (Auto-Generated)</option>
        )}

        {/* Option 2: Predefined test users */}
        {AVAILABLE_USERS.map((user) => (
          <option key={user} value={user}>
            {user}
          </option>
        ))}
      </select>
    </div>
  );
}
