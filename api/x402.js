/**
 * x402 Payment Protocol — API Route
 *
 * Implements agent-native HTTP payments per https://x402.org
 * Protected routes return HTTP 402 with payment requirements that
 * AI agents fulfill automatically via crypto micropayments.
 */

const FACILITATOR_URL = 'https://x402.org/facilitator';
const RECEIVER_WALLET = '0x0000000000000000000000000000000000000000';
const NETWORK = 'eip155:84532';
const PRIMARY_HOST = 'mohamed-tarek-abdelhady.vercel.app';

// All production domains (primary + secondary mirrors website-mohamed.vercel.app
// and eng-mta.netlify.app) serve this site. Derive resource base from the request
// host so payment requirements always reference the domain called.
function baseUrl(req) {
  const fwd = req && req.headers && req.headers['x-forwarded-host'];
  const host = (Array.isArray(fwd) ? fwd[0] : fwd) ||
    (req && req.headers && req.headers.host) ||
    PRIMARY_HOST;
  const protoHeader = req && req.headers && req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  return `${proto}://${host}`;
}

function toBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function buildPaymentRequirements(req) {
  const siteUrl = req ? baseUrl(req) : `https://${PRIMARY_HOST}`;
  const resourcePath = (req && req.url) ? req.url.split('?')[0] : '/api/x402';
  return {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: '1000',
        resource: `${siteUrl}${resourcePath}`,
        description: 'Mohamed Tarek Abdelhady Engineering API Access',
        mimeType: 'application/json',
        payTo: RECEIVER_WALLET,
        extra: {}
      }
    ],
    ordering: 'cheap-first',
    maxTimeoutSeconds: 60,
    mpp: {
      intent: 'charge',
      method: 'tempo',
      amount: '0.01',
      currency: 'USD',
      description: 'Mohamed Tarek Abdelhady Engineering API Access via Machine Payment Protocol'
    }
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, PAYMENT-SIGNATURE, PAYMENT-REQUIRED, PAYMENT-RESPONSE, WWW-Authenticate, X-Payment-Info');
  res.setHeader('Access-Control-Expose-Headers', 'PAYMENT-REQUIRED, PAYMENT-RESPONSE, WWW-Authenticate, X-Payment-Info');
  res.setHeader('Vary', 'PAYMENT-SIGNATURE, Accept');
  res.setHeader('Link', '</openapi.json>; rel="service-desc"');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
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
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 200;
        if (req.method === 'HEAD') {
          return res.end();
        }
        return res.end(JSON.stringify({
          message: 'Payment verified and settled. Access granted.',
          resource: `${baseUrl(req)}/api/x402`,
          timestamp: new Date().toISOString()
        }));
      }
    } catch {
      // Facilitator unavailable or invalid payment — fall through to 402
    }
  }

  const requirements = buildPaymentRequirements(req);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('PAYMENT-REQUIRED', toBase64Url(requirements));
  res.setHeader('WWW-Authenticate', 'MPP intent="charge", method="tempo", amount="0.01", currency="USD"');
  res.setHeader('X-Payment-Info', JSON.stringify(requirements.mpp));
  res.statusCode = 402;

  if (req.method === 'HEAD') {
    return res.end();
  }
  return res.end(JSON.stringify(requirements, null, 2));
}
