import express, { Request, Response } from 'express';
import { generateUUID } from '../utils/uuid';

const router = express.Router();

// Configuration for Internalization Service
const INTERNALIZATION_SERVICE_URL = process.env.INTERNALIZATION_SERVICE_URL || 'http://localhost:4000';

// Place an order (Routes to Internalization)
router.post('/place', async (req: Request, res: Response): Promise<any> => {
  try {
    const { symbol, side, quantity, price, clientId } = req.body;

    if (!symbol || !side || !quantity || !price) {
      return res.status(400).json({ message: 'Missing order details' });
    }

    // Forward to Internalization Platform
    const response = await fetch(`${INTERNALIZATION_SERVICE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: clientId || 'anonymous',
        symbol,
        side,
        quantity,
        price
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to process order in Internalization platform');
    }

    // Settlement Logic Check (min(buy, sell) is handled by the engine)
    // We return the result to the user
    return res.status(200).json({
      message: 'Order placed successfully',
      internalizationResult: data
    });

  } catch (error: any) {
    console.error('Order placement error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get Order Book for a symbol
router.get('/book/:symbol', async (req: Request, res: Response): Promise<any> => {
    try {
        const { symbol } = req.params;
        const response = await fetch(`${INTERNALIZATION_SERVICE_URL}/api/orderbook/${symbol}`);
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch order book' });
    }
});

export default router;
