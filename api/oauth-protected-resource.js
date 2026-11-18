/**
 * OAuth Protected Resource Metadata (RFC 9728)
 * Serves JSON at /.well-known/oauth-protected-resource via rewrite in vercel.json.
 *
 * Host-aware against an explicit allowlist of production domains.
 */

const PRIMARY_HOST = 'mohamed-tarek-abdelhady.vercel.app';
const ALLOWED_HOSTS = new Set([
  PRIMARY_HOST,
  'website-mohamed.vercel.app',
  'eng-mta.netlify.app'
]);

function safeHost(raw) {
  const candidate = String(Array.isArray(raw) ? raw[0] : (raw || ''))
    .split(',')[0]
    .trim()
    .toLowerCase();
  return ALLOWED_HOSTS.has(candidate) ? candidate : PRIMARY_HOST;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Authorization');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const host = safeHost(req.headers['x-forwarded-host'] || req.headers.host);
  const base = `https://${host}`;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  return res.end(JSON.stringify({
    resource: base,
    resource_name: 'Mohamed Tarek Abdelhady Portfolio',
    resource_documentation: `${base}/services.html`,
    authorization_servers: [base],
    scopes_supported: ['read', 'tools'],
    bearer_methods_supported: ['header']
  }));
}
