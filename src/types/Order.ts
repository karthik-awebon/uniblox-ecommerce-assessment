import { CartItem } from './CartItem';

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];

    totalAmount: number;
    discountCode?: string;
    discountAmount: number;
    finalAmount: number;

    timestamp: Date;
}