'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { PRODUCTS } from '@/lib/products';
import { cn } from '@/lib/utils/cn';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export default function CartSummary() {
  const { userId } = useUser();
  const queryClient = useQueryClient();

  // State for the "Winner" moment
  const [winningCode, setWinningCode] = useState<string | null>(null);
  // State for inputting a discount code
  const [discountInput, setDiscountInput] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // 1. Fetch Cart Data
  const { data: cartData } = useQuery({
    queryKey: ['cart', userId], // Refetch when user changes
    queryFn: async () => {
      const res = await fetch('/api/cart', {
        headers: { 'x-user-id': userId },
      });
      return (await res.json()).data;
    },
  });

  const items: CartItem[] = cartData?.items || [];

  // Calculate Subtotal (Client-side sync)
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 2. Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      setCheckoutError('');
      setWinningCode(null);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'x-user-id': userId },
        body: JSON.stringify({
          discountCode: discountInput || undefined, // Send undefined if empty
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Checkout failed');
      return json.data; // Returns { order, generatedCoupon }
    },
    onSuccess: (data) => {
      // Clear Cart Cache
      queryClient.setQueryData(['cart', userId], { items: [] });

      // This forces the AdminStats component to re-fetch immediately
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      setDiscountInput('');

      // Did we win?
      if (data.generatedCoupon) {
        setWinningCode(data.generatedCoupon);
      } else {
        alert('Order placed successfully!');
      }
    },
    onError: (err: Error) => {
      setCheckoutError(err.message);
    },
  });

  if (items.length === 0 && !winningCode) {
    return (
      <div className="py-8 text-center text-gray-500">Your cart is empty.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎉 WINNER NOTIFICATION 🎉 */}
      {winningCode && (
        <div className="rounded-lg border-2 border-green-500 bg-green-100 p-4 text-center">
          <h3 className="text-lg font-bold text-green-800">
            🎉 CONGRATULATIONS! 🎉
          </h3>
          <p className="text-green-700">You are the N-th customer!</p>
          <div className="mt-2 inline-block select-all rounded border border-green-300 bg-white px-4 py-2 font-mono text-xl font-bold">
            {winningCode}
          </div>
          <p className="mt-2 text-xs text-green-600">
            Copy this code for your next order!
          </p>
          <button
            onClick={() => setWinningCode(null)}
            className="mt-2 text-xs text-green-800 underline hover:text-green-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cart Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          return (
            <div
              key={item.productId}
              className="flex items-center justify-between border-b pb-2 text-sm"
            >
              <div>
                <span className="font-medium">
                  {product?.name || item.productId}
                </span>
                <div className="text-gray-500">
                  Qty: {item.quantity} x ${item.price}
                </div>
              </div>
              <div className="font-mono font-semibold">
                ${item.price * item.quantity}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals & Actions */}
      <div className="pt-2">
        <div className="mb-4 flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${subtotal}</span>
        </div>

        {/* Discount Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Discount Code"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
        </div>

        {checkoutError && (
          <div className="mb-3 rounded bg-red-50 p-2 text-xs text-red-500">
            Error: {checkoutError}
          </div>
        )}

        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={items.length === 0 || checkoutMutation.isPending}
          className={cn(
            'w-full rounded-lg py-3 font-bold text-white transition-all',
            checkoutMutation.isPending
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-xl'
          )}
        >
          {checkoutMutation.isPending ? 'Processing...' : 'Checkout & Pay'}
        </button>
      </div>
    </div>
  );
}
