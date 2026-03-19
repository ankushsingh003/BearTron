import express from 'express';
import cors from 'cors';
import { MatchingEngine } from './engine/MatchingEngine';
import { generateUUID } from './utils/uuid';
import { OrderSide } from './models/Order';

const app = express();
const port = 4000; // Separate port for Internalization platform

app.use(cors());
app.use(express.json());

const engine = new MatchingEngine();

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'Internalization Platform Online' });
});

// Submit an order
app.post('/api/orders', (req, res) => {
    const { clientId, symbol, side, quantity, price } = req.body;

    if (!clientId || !symbol || !side || !quantity || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = {
        id: generateUUID(),
        clientId,
        symbol,
        side: side as OrderSide,
        quantity,
        filledQuantity: 0,
        price,
        status: 'PENDING',
        createdAt: new Date()
    };

    const trades = engine.addOrder(order as any);

    res.json({
        message: 'Order processed',
        order,
        trades
    });
});

// Get order book
app.get('/api/orderbook/:symbol', (req, res) => {
    const { symbol } = req.params;
    res.json(engine.getOrderBook(symbol));
});

// Get trades
app.get('/api/trades/:symbol', (req, res) => {
    const { symbol } = req.params;
    res.json(engine.getTrades(symbol));
});

app.listen(port, () => {
    console.log(`Internalization Platform listening at http://localhost:${port}`);
});
