/**
 * Netlify Function: oauth-authorization-server (RFC 8414 + OpenID Discovery)
 * Port of api/oauth-authorization-server.js for dual-deploy.
 */

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Authorization',
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  };
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  const url = new URL(req.url);
  const host =
    req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
  const base = `${proto}://${host}`;

  return new Response(
    JSON.stringify({
      issuer: base,
      authorization_endpoint: `${base}/authorize`,
      token_endpoint: `${base}/oauth2/token`,
      userinfo_endpoint: `${base}/agent/identity`,
      revocation_endpoint: `${base}/oauth2/revoke`,
      jwks_uri: `${base}/.well-known/jwks.json`,
      response_types_supported: ['code', 'token', 'id_token', 'code token', 'code id_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email', 'read', 'tools'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
      grant_types_supported: [
        'authorization_code',
        'implicit',
        'urn:ietf:params:oauth:grant-type:jwt-bearer',
      ],
      service_documentation: `${base}/Mohamed%20-%20Services.html`,
      claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat', 'name', 'email'],
      agent_auth: {
        skill: `${base}/auth.md`,
        identity_endpoint: `${base}/agent/identity`,
        claim_endpoint: `${base}/agent/identity/claim`,
        identity_types_supported: ['anonymous'],
        anonymous: { credential_types_supported: ['api_key'] },
        credential_types_supported: ['api_key'],
        claim_uri: `${base}/.well-known/oauth-protected-resource`,
        revocation_uri: `${base}/oauth2/revoke`,
        events_supported: [
          'https://schemas.workos.com/events/agent/auth/identity/assertion/revoked',
        ],
      },
    }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
  );
};
