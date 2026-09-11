/**
 * Agent Claim Endpoint
 * POST /api/agent/identity/claim
 *
 * Exchange an identity assertion for an access token.
 * Per AGENTIC.md Step 4 — Exchange the assertion.
 */

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grant_type, assertion, resource } = req.body || {};

  // Validate grant type
  if (grant_type !== 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Unsupported grant type. Use urn:ietf:params:oauth:grant-type:jwt-bearer'
    });
  }

  // Validate assertion
  if (!assertion) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'assertion is required'
    });
  }

  // Validate resource
  if (resource !== 'https://mohamedtarek.vercel.app') {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Invalid resource'
    });
  }

  // In production: verify the JWT signature, check expiry, validate claims
  // For now, return a demo access token
  const accessToken = `at_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return res.status(200).json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'read'
  });
}
