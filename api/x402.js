/**
 * x402 Payment Protocol — API Route
 *
 * Implements agent-native HTTP payments per https://x402.org
 * Protected routes return HTTP 402 with payment requirements.
 *
 * In production, replace RECEIVER_WALLET with your actual wallet address
 * and install @x402/next middleware for full protocol support.
 */

const FACILITATOR_URL = 'https://x402.org/facilitator';
const RECEIVER_WALLET = '0x0000000000000000000000000000000000000000';
const NETWORK = 'eip155:84532';
const SITE_URL = 'https://website-mohamed.vercel.app';

function toBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, PAYMENT-SIGNATURE');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const paymentSignature = req.headers['payment-signature'];

  if (paymentSignature) {
    try {
      const paymentPayload = JSON.parse(Buffer.from(paymentSignature, 'base64url').toString());

      const verifyRes = await fetch(`${FACILITATOR_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements: buildPaymentRequirements()
        })
      });

      if (verifyRes.ok) {
        const settleRes = await fetch(`${FACILITATOR_URL}/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentPayload,
            paymentRequirements: buildPaymentRequirements()
          })
        });

        const settlement = await settleRes.json();
        res.setHeader('PAYMENT-RESPONSE', toBase64Url(settlement));
        return res.status(200).json({
          message: 'Payment verified and settled. Access granted.',
          resource: `${SITE_URL}/api/x402`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      // Facilitator unavailable or invalid payment — fall through to 402
    }
  }

  const requirements = buildPaymentRequirements();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('PAYMENT-REQUIRED', toBase64Url(requirements));
  return res.status(402).json(requirements);
}

function buildPaymentRequirements() {
  return {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: '1000',
        resource: `${SITE_URL}/api/x402`,
        description: 'Access to premium API endpoint',
        mimeType: 'application/json',
        payTo: RECEIVER_WALLET,
        extra: {}
      }
    ],
    ordering: 'cheap-first',
    maxTimeoutSeconds: 60
  };
}
