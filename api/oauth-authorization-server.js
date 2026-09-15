/**
 * OAuth Authorization Server Metadata (RFC 8414) + OpenID Discovery.
 * Serves /.well-known/oauth-authorization-server and
 * /.well-known/openid-configuration via rewrites in vercel.json.
 *
 * Host-aware: issuer and all endpoint URLs are derived from the request
 * host so both production domains (mohamed-tarek-abdelhady.vercel.app and
 * website-mohamed.vercel.app) validate consistently. Static JSON files
 * remain as fallbacks with primary-canonical URLs.
 */

const PRIMARY_HOST = 'mohamed-tarek-abdelhady.vercel.app';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Authorization');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ||
    req.headers.host ||
    PRIMARY_HOST;
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  const base = `${proto}://${host}`;

  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
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
    grant_types_supported: ['authorization_code', 'implicit', 'urn:ietf:params:oauth:grant-type:jwt-bearer'],
    service_documentation: `${base}/Mohamed%20-%20Services.html`,
    claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat', 'name', 'email'],
    agent_auth: {
      skill: `${base}/auth.md`,
      identity_endpoint: `${base}/agent/identity`,
      claim_endpoint: `${base}/agent/identity/claim`,
      identity_types_supported: ['anonymous'],
      anonymous: {
        credential_types_supported: ['api_key']
      },
      credential_types_supported: ['api_key'],
      claim_uri: `${base}/.well-known/oauth-protected-resource`,
      revocation_uri: `${base}/oauth2/revoke`,
      events_supported: [
        'https://schemas.workos.com/events/agent/auth/identity/assertion/revoked'
      ]
    }
  });
}
