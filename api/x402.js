/**
 * x402 Payment Protocol — API Route
 *
 * Demonstrates agent-native HTTP payments per https://x402.org
 * Protected routes return HTTP 402 with payment requirements.
 *
 * In production, replace RECEIVER_WALLET with your actual wallet address.
 */

const FACILITATOR_URL = 'https://x402.org/facilitator';
const RECEIVER_WALLET = '0x0000000000000000000000000000000000000000';
const NETWORK = 'base-sepolia';
const SITE_URL = 'https://website-mohamed.vercel.app';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-PAYMENT');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const paymentHeader = req.headers['x-payment'];

  if (paymentHeader) {
    try {
      const verifyRes = await fetch(`${FACILITATOR_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentHeader,
          paymentRequirements: {
            x402Version: 1,
            accepts: [{
              scheme: 'exact',
              network: NETWORK,
              maxAmountRequired: '1000',
              resource: `${SITE_URL}/api/x402`,
              description: 'Access to premium API endpoint',
              mimeType: 'application/json',
              payTo: RECEIVER_WALLET,
              extra: {}
            }],
            ordering: 'cheap-first',
            maxTimeoutSeconds: 60
          }
        })
      });

      if (verifyRes.ok) {
        return res.status(200).json({
          message: 'Payment verified. Access granted.',
          resource: `${SITE_URL}/api/x402`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      // Facilitator unavailable — fall through to 402
    }
  }

  const paymentRequirements = {
    x402Version: 1,
    accepts: [{
      scheme: 'exact',
      network: NETWORK,
      maxAmountRequired: '1000',
      resource: `${SITE_URL}/api/x402`,
      description: 'Access to premium API endpoint',
      mimeType: 'application/json',
      payTo: RECEIVER_WALLET,
      extra: {}
    }],
    ordering: 'cheap-first',
    maxTimeoutSeconds: 60
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-PAYMENT-RESPONSE', JSON.stringify(paymentRequirements));
  return res.status(402).json(paymentRequirements);
}
