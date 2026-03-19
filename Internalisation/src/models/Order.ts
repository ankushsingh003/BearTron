export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';

export interface Order {
    id: string;
    clientId: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    filledQuantity: number;
    price: number; // For simplicity, we'll use a single price or market price
    status: OrderStatus;
    createdAt: Date;
}
