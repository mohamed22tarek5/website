/**
 * x402 Payment Protocol — API Route
 *
 * Demonstrates agent-native HTTP payments per https://x402.org
 * Protected routes return HTTP 402 with payment requirements.
 *
 * In production, replace the wallet address and facilitator URL
 * with your actual values.
 */

const FACILITATOR_URL = 'https://x402.org/facilitator';
const RECEIVER_WALLET = '0x0000000000000000000000000000000000000000';
const NETWORK = 'base-sepolia';

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-PAYMENT');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check for payment header
  const paymentHeader = req.headers['x-payment'];

  if (paymentHeader) {
    // In production: verify the payment with the facilitator
    // POST {FACILITATOR_URL}/verify with the payment payload
    // If valid, serve the resource
    return res.status(200).json({
      message: 'Payment verified. Access granted.',
      resource: 'https://mohamedtarek.vercel.app/api/protected',
      timestamp: new Date().toISOString()
    });
  }

  // No payment — return HTTP 402 with payment requirements
  const paymentRequirements = {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: '1000',
        resource: 'https://mohamedtarek.vercel.app/api/protected',
        description: 'Access to premium API endpoint',
        mimeType: 'application/json',
        payTo: RECEIVER_WALLET,
        extra: {}
      }
    ],
    ordering: 'cheap-first',
    maxTimeoutSeconds: 60,
    paymentRequirements: {
      maxAmountRequired: '1000',
      resource: 'https://mohamedtarek.vercel.app/api/protected',
      description: 'Access to premium API endpoint',
      mimeType: 'application/json',
      payTo: RECEIVER_WALLET,
      network: NETWORK,
      scheme: 'exact'
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-PAYMENT-RESPONSE', JSON.stringify(paymentRequirements));
  return res.status(402).json(paymentRequirements);
}
