/**
 * Netlify Function: x402
 * Port of api/x402.js for dual-deploy (Vercel + Netlify).
 */

const FACILITATOR_URL = 'https://x402.org/facilitator';
const ZERO_WALLET = '0x0000000000000000000000000000000000000000';
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const NETWORK = 'eip155:84532';
const ALLOWED_HOSTS = new Set([
  'mohamed-tarek-abdelhady.vercel.app',
  'website-mohamed.vercel.app',
  'eng-mta.netlify.app',
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

function baseUrl(req, url) {
  const rawHost =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host || 'eng-mta.netlify.app';
  const host = String(rawHost).split(',')[0].trim().toLowerCase();
  const safeHost = ALLOWED_HOSTS.has(host) ? host : 'eng-mta.netlify.app';
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

function buildPaymentRequirements(siteUrl, wallet) {
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
        payTo: wallet.address,
        extra: wallet.configured ? {} : { sandbox: true },
      },
    ],
    ordering: 'cheap-first',
    maxTimeoutSeconds: 60,
  };
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, PAYMENT-SIGNATURE',
  'Access-Control-Expose-Headers': 'PAYMENT-REQUIRED, PAYMENT-RESPONSE',
  'Cache-Control': 'no-store',
};

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  const url = new URL(req.url);
  const siteUrl = baseUrl(req, url);
  const wallet = getReceiverWallet();
  const paymentSignature = req.headers.get('payment-signature');

  if (
    wallet.configured &&
    typeof paymentSignature === 'string' &&
    paymentSignature.length > 0 &&
    paymentSignature.length <= MAX_SIG_LENGTH
  ) {
    try {
      const paymentPayload = JSON.parse(Buffer.from(paymentSignature, 'base64url').toString('utf-8'));
      const requirements = buildPaymentRequirements(siteUrl, wallet);

      const verifyRes = await fetchWithTimeout(`${FACILITATOR_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements: requirements,
        }),
      });

      if (verifyRes.ok) {
        const verification = await verifyRes.json();
        if (verification && verification.isValid === true) {
          const settleRes = await fetchWithTimeout(`${FACILITATOR_URL}/settle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentPayload,
              paymentRequirements: requirements,
            }),
          });

          if (settleRes.ok) {
            const settlement = await settleRes.json();
            if (settlement && settlement.success === true) {
              return new Response(
                req.method === 'HEAD'
                  ? null
                  : JSON.stringify({
                      message: 'Payment verified and settled. Access granted.',
                      resource: `${siteUrl}/api/x402`,
                      timestamp: new Date().toISOString(),
                    }),
                {
                  status: 200,
                  headers: {
                    ...cors,
                    'Content-Type': 'application/json; charset=utf-8',
                    'PAYMENT-RESPONSE': toBase64Url(settlement),
                  },
                }
              );
            }
          }
        }
      }
    } catch {
      // fall through to 402
    }
  }

  const requirements = buildPaymentRequirements(siteUrl, wallet);
  return new Response(req.method === 'HEAD' ? null : JSON.stringify(requirements), {
    status: 402,
    headers: {
      ...cors,
      'Content-Type': 'application/json; charset=utf-8',
      'PAYMENT-REQUIRED': toBase64Url(requirements),
    },
  });
};
