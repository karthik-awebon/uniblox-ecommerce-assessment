'use client';

import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils/cn';

interface AdminStatsData {
  totalItemsPurchased: number;
  totalRevenue: number;
  totalDiscountsGiven: number;
  totalDiscountCodes: number;
}

export default function AdminStats() {
  // Fetch stats every 2 seconds to show live updates
  const { data, isLoading, isError } = useQuery<AdminStatsData>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return (await res.json()).data;
    },
  });

  if (isLoading)
    return <div className="h-32 animate-pulse rounded-md bg-gray-200"></div>;
  if (isError)
    return <div className="text-red-500">Failed to load admin data</div>;

  return (
    <div className="rounded-xl bg-slate-900 p-6 text-white shadow-2xl">
      <h2 className="mb-6 flex items-center gap-2 border-b border-slate-700 pb-2 text-xl font-bold">
        📊 Admin Live View
        <span className="ml-auto animate-pulse text-xs font-normal text-green-400">
          ● Real-time
        </span>
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Revenue" value={`$${data?.totalRevenue}`} />
        <StatCard label="Items Sold" value={data?.totalItemsPurchased} />
        <StatCard
          label="Discounts Given"
          value={`$${data?.totalDiscountsGiven}`}
        />
        <StatCard
          label="Coupons Generated"
          value={data?.totalDiscountCodes}
          highlight
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number | undefined;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg bg-slate-800 p-4',
        highlight && 'ring-2 ring-yellow-500'
      )}
    >
      <div className="mb-1 text-xs uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="font-mono text-2xl font-bold">{value}</div>
    </div>
  );
}
