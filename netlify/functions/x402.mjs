/**
 * Netlify Function: x402
 * Port of api/x402.js for dual-deploy (Vercel + Netlify).
 */

const FACILITATOR_URL = 'https://x402.org/facilitator';
const RECEIVER_WALLET = '0x0000000000000000000000000000000000000000';
const NETWORK = 'eip155:84532';

function baseUrl(req, url) {
  const host =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
  return `${proto}://${host}`;
}

function toBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function buildPaymentRequirements(siteUrl) {
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
        extra: {},
      },
    ],
    ordering: 'cheap-first',
    maxTimeoutSeconds: 60,
  };
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, PAYMENT-SIGNATURE',
};

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  const url = new URL(req.url);
  const siteUrl = baseUrl(req, url);
  const paymentSignature = req.headers.get('payment-signature');

  if (paymentSignature) {
    try {
      const paymentPayload = JSON.parse(Buffer.from(paymentSignature, 'base64url').toString());

      const verifyRes = await fetch(`${FACILITATOR_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements: buildPaymentRequirements(siteUrl),
        }),
      });

      if (verifyRes.ok) {
        const settleRes = await fetch(`${FACILITATOR_URL}/settle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentPayload,
            paymentRequirements: buildPaymentRequirements(siteUrl),
          }),
        });

        const settlement = await settleRes.json();
        return new Response(
          JSON.stringify({
            message: 'Payment verified and settled. Access granted.',
            resource: `${siteUrl}/api/x402`,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              ...cors,
              'Content-Type': 'application/json',
              'PAYMENT-RESPONSE': toBase64Url(settlement),
            },
          }
        );
      }
    } catch {
      // fall through to 402
    }
  }

  const requirements = buildPaymentRequirements(siteUrl);
  return new Response(JSON.stringify(requirements), {
    status: 402,
    headers: {
      ...cors,
      'Content-Type': 'application/json',
      'PAYMENT-REQUIRED': toBase64Url(requirements),
      'Cache-Control': 'no-store',
    },
  });
};
