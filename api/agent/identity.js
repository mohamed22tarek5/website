/**
 * Agent Identity Endpoint
 * POST /api/agent/identity
 *
 * Returns a pre-signed identity assertion for anonymous agents.
 * Per AGENTIC.md Step 3 — Register.
 */

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.body || {};

  if (type !== 'anonymous') {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Only anonymous registration is supported'
    });
  }

  // Generate a registration ID and identity assertion
  const registrationId = `reg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const assertionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // Derive issuer/audience from the request host so assertions validate
  // on both production domains (mohamed-tarek-abdelhady.vercel.app and
  // website-mohamed.vercel.app), which serve this same deployment.
  const fwdHost = req.headers['x-forwarded-host'];
  const host = (Array.isArray(fwdHost) ? fwdHost[0] : fwdHost) ||
    req.headers.host ||
    'mohamed-tarek-abdelhady.vercel.app';
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  const issuer = `${proto}://${host}`;

  // In production, this would be a signed JWT from the identity provider
  const identityAssertion = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({
    iss: issuer,
    sub: registrationId,
    aud: issuer,
    exp: Math.floor(Date.now() / 1000) + 31536000,
    iat: Math.floor(Date.now() / 1000),
    type: 'anonymous',
    scopes: ['read']
  })).toString('base64url')}.signature-placeholder`;

  return res.status(200).json({
    registration_id: registrationId,
    registration_type: 'anonymous',
    identity_assertion: identityAssertion,
    assertion_expires: assertionExpiry,
    pre_claim_scopes: ['read']
  });
}
