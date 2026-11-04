/**
 * Universal Commerce Protocol (UCP) — API Endpoint
 *
 * Implements UCP discovery and merchant profile per https://ucp.dev/specification/overview/
 * Resolves dev.ucp.shopping transport requests.
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('Vary', 'Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const profile = {
    ucp: {
      version: '2026-08-25',
      status: 'ready',
      merchant: {
        name: 'Mohamed Tarek Abdelhady',
        description: 'Communication & Electronics Engineer Portfolio and Engineering Tools',
        url: 'https://mohamed-tarek-abdelhady.vercel.app'
      },
      services: {
        'dev.ucp.shopping': {
          version: '2026-08-25',
          transport: 'rest',
          endpoint: 'https://mohamed-tarek-abdelhady.vercel.app/api/ucp'
        }
      },
      capabilities: {
        'dev.ucp.shopping.checkout': {
          version: '2026-08-25',
          spec: 'https://ucp.dev/2026-08-25/specification/shopping/checkout'
        },
        content_access: true,
        micropayments: true
      },
      payment_handlers: [
        {
          id: 'x402',
          name: 'x402 HTTP Payment Protocol',
          spec: 'https://x402.org',
          endpoint: 'https://mohamed-tarek-abdelhady.vercel.app/api/x402'
        }
      ]
    }
  };

  res.statusCode = 200;
  if (req.method === 'HEAD') {
    return res.end();
  }
  return res.end(JSON.stringify(profile, null, 2));
}
