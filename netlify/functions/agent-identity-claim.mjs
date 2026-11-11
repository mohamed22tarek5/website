/**
 * Netlify Function: agent-identity-claim
 * Port of api/agent/identity/claim.js for dual-deploy.
 * POST /api/agent/identity/claim -> /.netlify/functions/agent-identity-claim
 */

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const { grant_type, assertion, resource } = body;

  const badRequest = (error_description) =>
    new Response(JSON.stringify({ error: 'invalid_request', error_description }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  if (grant_type !== 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
    return badRequest('Unsupported grant type. Use urn:ietf:params:oauth:grant-type:jwt-bearer');
  }
  if (!assertion) {
    return badRequest('assertion is required');
  }

  const url = new URL(req.url);
  const host =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const allowedResources = new Set([
    `https://${host}`,
    'https://mohamed-tarek-abdelhady.vercel.app',
    'https://website-mohamed.vercel.app',
    'https://eng-mta.netlify.app',
  ]);
  if (!allowedResources.has(resource)) {
    return badRequest('Invalid resource');
  }

  const accessToken = `at_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return new Response(
    JSON.stringify({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'read',
    }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
  );
};
