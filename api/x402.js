/**
 * x402 Payment Protocol — API Route
 *
 * Implements agent-native HTTP payments per https://x402.org
 * Protected routes return HTTP 402 with payment requirements that
 * AI agents fulfill automatically via crypto micropayments.
 *
 * Configure X402_RECEIVER_WALLET in Vercel environment variables before
 * accepting real settlements.
 */

const FACILITATOR_URL = 'https://x402.org/facilitator';
const ZERO_WALLET = '0x0000000000000000000000000000000000000000';
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const NETWORK = 'eip155:84532';
const PRIMARY_HOST = 'mohamed-tarek-abdelhady.vercel.app';
const ALLOWED_HOSTS = new Set([
  PRIMARY_HOST,
  'website-mohamed.vercel.app',
  'eng-mta.netlify.app'
]);
const FETCH_TIMEOUT_MS = 5000;
const MAX_SIG_LENGTH = 8192;

function getReceiverWallet() {
  const configured = (process.env.X402_RECEIVER_WALLET || '').trim();
  if (EVM_ADDRESS_RE.test(configured) && configured.toLowerCase() !== ZERO_WALLET) {
    return { address: configured, configured: true };
  }
  return { address: ZERO_WALLET, configured: false };
}

function baseUrl(req) {
  const fwd = req && req.headers && req.headers['x-forwarded-host'];
  const rawHost = (Array.isArray(fwd) ? fwd[0] : fwd) ||
    (req && req.headers && req.headers.host) ||
    PRIMARY_HOST;
  const host = String(rawHost).split(',')[0].trim().toLowerCase();
  const safeHost = ALLOWED_HOSTS.has(host) ? host : PRIMARY_HOST;
  return `https://${safeHost}`;
}

function toBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function buildPaymentRequirements(req) {
  const siteUrl = req ? baseUrl(req) : `https://${PRIMARY_HOST}`;
  const rawPath = (req && req.url) ? req.url.split('?')[0] : '/api/x402';
  const resourcePath = /^\/api\/(x402|v1|payment)$/.test(rawPath) ? rawPath : '/api/x402';
  const wallet = getReceiverWallet();
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
        payTo: wallet.address,
        extra: wallet.configured ? {} : { sandbox: true }
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
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Link', '</openapi.json>; rel="service-desc"');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const wallet = getReceiverWallet();
  const paymentSignature = req.headers['payment-signature'];

  if (
    wallet.configured &&
    typeof paymentSignature === 'string' &&
    paymentSignature.length > 0 &&
    paymentSignature.length <= MAX_SIG_LENGTH
  ) {
    try {
      const paymentPayload = JSON.parse(Buffer.from(paymentSignature, 'base64url').toString('utf-8'));
      const requirements = buildPaymentRequirements(req);

      const verifyRes = await fetchWithTimeout(`${FACILITATOR_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements: requirements
        })
      });

      if (verifyRes.ok) {
        const verification = await verifyRes.json();
        if (verification && verification.isValid === true) {
          const settleRes = await fetchWithTimeout(`${FACILITATOR_URL}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentPayload,
              paymentRequirements: requirements
            })
          });

          if (settleRes.ok) {
            const settlement = await settleRes.json();
            if (settlement && settlement.success === true) {
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
          }
        }
      }
    } catch {
      // Facilitator unavailable, timed out, or invalid payment — fall through to 402
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
