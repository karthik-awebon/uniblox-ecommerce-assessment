'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUser } from '@/context/UserContext';
import { PRODUCTS } from '@/lib/products';

export default function ProductList() {
  const { userId } = useUser();
  const queryClient = useQueryClient();

  // Mutation to Add Item
  const { mutate, isPending } = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'x-user-id': userId },
        body: JSON.stringify({
          productId,
          quantity: 1,
          price: PRODUCTS.find((p) => p.id === productId)?.price,
        }),
      });
      if (!res.ok) throw new Error('Failed to add');
      return res.json();
    },
    onSuccess: () => {
      // Refresh Cart Data immediately
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      {PRODUCTS.map((product) => (
        <div
          key={product.id}
          className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-lg"
        >
          <div className="mb-2 text-4xl">{product.image}</div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-600">${product.price}</p>

          <button
            onClick={() => mutate(product.id)}
            disabled={isPending}
            className="mt-3 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      ))}
    </div>
  );
}
