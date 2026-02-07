import { Cart } from './Cart';
import { DiscountCode } from './DiscountCode';
import { Order } from './Order';

export interface InMemoryStore {
    carts: Record<string, Cart>;
    orders: Order[];
    discountCodes: Record<string, DiscountCode>;

    orderCount: number;
    n: number;
    x: number;
}