/**
 * Netlify Function: agent-identity
 * Port of api/agent/identity.js for dual-deploy.
 * POST /api/agent/identity -> /.netlify/functions/agent-identity
 */

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  if (body.type !== 'anonymous') {
    return new Response(
      JSON.stringify({
        error: 'invalid_request',
        error_description: 'Only anonymous registration is supported',
      }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const host =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
  const issuer = `${proto}://${host}`;

  const registrationId = `reg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const assertionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const identityAssertion = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
    JSON.stringify({
      iss: issuer,
      sub: registrationId,
      aud: issuer,
      exp: Math.floor(Date.now() / 1000) + 31536000,
      iat: Math.floor(Date.now() / 1000),
      type: 'anonymous',
      scopes: ['read'],
    })
  ).toString('base64url')}.signature-placeholder`;

  return new Response(
    JSON.stringify({
      registration_id: registrationId,
      registration_type: 'anonymous',
      identity_assertion: identityAssertion,
      assertion_expires: assertionExpiry,
      pre_claim_scopes: ['read'],
    }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
  );
};
