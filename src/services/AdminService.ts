import { store } from '@/lib/db/store';
import { AdminStats } from '@/types';

export class AdminService {
  /**
   * Aggregates statistics from the in-memory store.
   * * Complexity: O(N) where N is the number of orders.
   * * In a real DB, this would be a simple SQL query (SELECT SUM(amount)...).
   */
  getStats(): AdminStats {
    const orders = store.getOrders();
    const storeStats = store.getStats(); // Reusing the basic stats from Store

    const totalItemsPurchased = orders.reduce((sum, order) => {
      const orderItemsCount = order.items.reduce(
        (qty, item) => qty + item.quantity,
        0
      );
      return sum + orderItemsCount;
    }, 0);

    const totalDiscountsGiven = orders.reduce((sum, order) => {
      return sum + order.discountAmount;
    }, 0);

    return {
      totalItemsPurchased,
      totalRevenue: storeStats.totalRevenue,
      totalDiscountCodes: storeStats.discountCodesSize,
      totalDiscountsGiven,
    };
  }
}

export const adminService = new AdminService();
