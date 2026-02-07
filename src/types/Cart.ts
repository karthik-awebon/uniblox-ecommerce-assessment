import { CartItem } from './CartItem';

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
}