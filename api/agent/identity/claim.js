/**
 * Agent Claim Endpoint
 * POST /api/agent/identity/claim
 *
 * Exchange an identity assertion for an access token.
 * Per AGENTIC.md Step 4 — Exchange the assertion.
 */

/**
 * Vercel's Node runtime does not populate req.body, so parse the raw
 * stream ourselves. Kept local (no cross-directory import) to match the
 * self-contained style of the other functions in this project.
 */
function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const { grant_type, assertion, resource } = await readJsonBody(req);

  const badRequest = (error_description) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'invalid_request', error_description }));
  };

  // Validate grant type
  if (grant_type !== 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
    return badRequest('Unsupported grant type. Use urn:ietf:params:oauth:grant-type:jwt-bearer');
  }

  // Validate assertion
  if (!assertion) {
    return badRequest('assertion is required');
  }

  // Validate resource — accept the domain the agent actually called.
  // Both production domains serve this same deployment; the primary
  // canonical domain is always accepted as well.
  const fwdHost = req.headers['x-forwarded-host'];
  const host = (Array.isArray(fwdHost) ? fwdHost[0] : fwdHost) ||
    req.headers.host ||
    'mohamed-tarek-abdelhady.vercel.app';
  const allowedResources = new Set([
    `https://${host}`,
    'https://mohamed-tarek-abdelhady.vercel.app',
    'https://website-mohamed.vercel.app'
  ]);
  if (!allowedResources.has(resource)) {
    return badRequest('Invalid resource');
  }

  // In production: verify the JWT signature, check expiry, validate claims
  // For now, return a demo access token
  const accessToken = `at_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  res.statusCode = 200;
  return res.end(JSON.stringify({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'read'
  }));
}
