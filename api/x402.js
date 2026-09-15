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
const PRIMARY_HOST = 'mohamed-tarek-abdelhady.vercel.app';

// Both production domains (mohamed-tarek-abdelhady.vercel.app and
// website-mohamed.vercel.app) serve this same deployment. Derive the
// resource base from the request host so payment requirements always
// reference the domain the agent actually called.
function baseUrl(req) {
  const fwd = req.headers['x-forwarded-host'];
  const host = (Array.isArray(fwd) ? fwd[0] : fwd) ||
    (req && req.headers.host) ||
    PRIMARY_HOST;
  const protoHeader = req && req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  return `${proto}://${host}`;
}

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
          paymentRequirements: buildPaymentRequirements(req)
        })
      });

      if (verifyRes.ok) {
        const settleRes = await fetch(`${FACILITATOR_URL}/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentPayload,
            paymentRequirements: buildPaymentRequirements(req)
          })
        });

        const settlement = await settleRes.json();
        res.setHeader('PAYMENT-RESPONSE', toBase64Url(settlement));
        return res.status(200).json({
          message: 'Payment verified and settled. Access granted.',
          resource: `${baseUrl(req)}/api/x402`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      // Facilitator unavailable or invalid payment — fall through to 402
    }
  }

  const requirements = buildPaymentRequirements(req);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('PAYMENT-REQUIRED', toBase64Url(requirements));
  return res.status(402).json(requirements);
}

function buildPaymentRequirements(req) {
  const siteUrl = req ? baseUrl(req) : `https://${PRIMARY_HOST}`;
  return {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: '1000',
        resource: `${siteUrl}/api/x402`,
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
