const BASE_URL = 'http://localhost:5000/api/order';

async function simulateInternalization() {
    console.log('--- Starting Internalization Simulation ---');

    // 1. Customer A places a BUY order for 100 shares at $150
    console.log('Customer A: BUY 100 AAPL @ 150');
    const buyRes = await fetch(`${BASE_URL}/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clientId: 'customer_a',
            symbol: 'AAPL',
            side: 'BUY',
            quantity: 100,
            price: 150
        })
    });
    console.log('Response A:', await buyRes.json());

    // 2. Customer B places a SELL order for 60 shares at $150
    console.log('\nCustomer B: SELL 60 AAPL @ 150');
    const sellRes = await fetch(`${BASE_URL}/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clientId: 'customer_b',
            symbol: 'AAPL',
            side: 'SELL',
            quantity: 60,
            price: 150
        })
    });
    const sellData = await sellRes.json();
    console.log('Response B:', sellData);

    // 3. Verify min(buy, sell) settlement
    const trades = sellData.internalizationResult.trades;
    if (trades && trades.length > 0) {
        console.log('\n✅ SUCCESS: Internalized match found!');
        console.log(`Matched Quantity: ${trades[0].quantity} (min(100, 60))`);
        console.log(`Execution Price: ${trades[0].price}`);
    } else {
        console.log('\n❌ FAILED: No internal match found.');
    }
}

simulateInternalization();
// Note: This requires both servers (5000 and 4000) to be running.
