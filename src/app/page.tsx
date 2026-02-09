import AdminStats from '@/components/admin/AdminStats';
import ProductList from '@/components/shop/ProductList';
// We will build this Cart component next
import CartSummary from '@/components/shop/CartSummary';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* LEFT COLUMN: SHOP (User View) - Takes up 7/12 width */}
      <div className="space-y-8 lg:col-span-7">
        <section>
          <h2 className="mb-4 text-2xl font-bold">🛍️ Shop Products</h2>
          <ProductList />
        </section>

        <section className="rounded-xl border-t-4 border-blue-500 bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-bold">🛒 Your Cart</h2>
          {/* Placeholder for now, we build this next */}
          <CartSummary />
        </section>
      </div>

      {/* RIGHT COLUMN: ADMIN (System View) - Takes up 5/12 width */}
      <div className="space-y-6 lg:col-span-5">
        <div className="sticky top-4">
          <AdminStats />

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <strong>💡 Pro Tip:</strong>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Add items on the left.</li>
              <li>Checkout to see Revenue update on the right.</li>
              <li>
                Every <strong>Nth</strong> order (default: 5) wins a code!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
