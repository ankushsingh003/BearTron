export interface Trade {
    id: string;
    buyOrderId: string;
    sellOrderId: string;
    symbol: string;
    quantity: number;
    price: number;
    timestamp: Date;
}
