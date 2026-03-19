import { Order } from '../models/Order';
import { Trade } from '../models/Trade';
import { generateUUID } from '../utils/uuid';

export class MatchingEngine {
    private buyOrders: Order[] = [];
    private sellOrders: Order[] = [];
    private trades: Trade[] = [];

    public addOrder(order: Order): Trade[] {
        const newTrades: Trade[] = [];
        
        if (order.side === 'BUY') {
            this.matchOrder(order, this.sellOrders, newTrades);
            if (order.status !== 'FILLED') {
                this.buyOrders.push(order);
                this.buyOrders.sort((a, b) => b.price - a.price); // Price priority
            }
        } else {
            this.matchOrder(order, this.buyOrders, newTrades);
            if (order.status !== 'FILLED') {
                this.sellOrders.push(order);
                this.sellOrders.sort((a, b) => a.price - b.price); // Price priority
            }
        }

        this.trades.push(...newTrades);
        return newTrades;
    }

    private matchOrder(incomingOrder: Order, oppositeOrders: Order[], newTrades: Trade[]) {
        for (let i = 0; i < oppositeOrders.length; i++) {
            const makerOrder = oppositeOrders[i];

            // For internalization, we match if prices overlap or it's a market match
            // Simple match logic: BUY price >= SELL price
            const canMatch = incomingOrder.side === 'BUY' 
                ? incomingOrder.price >= makerOrder.price 
                : incomingOrder.price <= makerOrder.price;

            if (canMatch) {
                const matchQuantity = Math.min(
                    incomingOrder.quantity - incomingOrder.filledQuantity,
                    makerOrder.quantity - makerOrder.filledQuantity
                );

                if (matchQuantity > 0) {
                    const executionPrice = makerOrder.price; // Maker price priority
                    
                    incomingOrder.filledQuantity += matchQuantity;
                    makerOrder.filledQuantity += matchQuantity;

                    incomingOrder.status = incomingOrder.filledQuantity === incomingOrder.quantity ? 'FILLED' : 'PARTIALLY_FILLED';
                    makerOrder.status = makerOrder.filledQuantity === makerOrder.quantity ? 'FILLED' : 'PARTIALLY_FILLED';

                    newTrades.push({
                        id: generateUUID(),
                        buyOrderId: incomingOrder.side === 'BUY' ? incomingOrder.id : makerOrder.id,
                        sellOrderId: incomingOrder.side === 'SELL' ? incomingOrder.id : makerOrder.id,
                        symbol: incomingOrder.symbol,
                        quantity: matchQuantity,
                        price: executionPrice,
                        timestamp: new Date()
                    });

                    if (makerOrder.status === 'FILLED') {
                        oppositeOrders.splice(i, 1);
                        i--;
                    }

                    if (incomingOrder.status === 'FILLED') break;
                }
            }
        }
    }

    public getOrderBook(symbol: string) {
        return {
            buys: this.buyOrders.filter(o => o.symbol === symbol),
            sells: this.sellOrders.filter(o => o.symbol === symbol)
        };
    }

    public getTrades(symbol: string) {
        return this.trades.filter(t => t.symbol === symbol);
    }
}
