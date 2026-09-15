/**
 * OAuth Protected Resource Metadata (RFC 9728)
 * Serves JSON at /.well-known/oauth-protected-resource via rewrite in vercel.json.
 *
 * Returns resource identifier derived from request Host so the metadata
 * always matches the scanned origin (production, preview, or custom domain).
 */

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
    'website-mohamed.vercel.app';
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  const base = `${proto}://${host}`;

  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    resource: base,
    resource_name: 'Mohamed Tarek Portfolio',
    resource_documentation: `${base}/Mohamed%20-%20Services.html`,
    authorization_servers: [base],
    scopes_supported: ['read', 'tools'],
    bearer_methods_supported: ['header']
  });
}
