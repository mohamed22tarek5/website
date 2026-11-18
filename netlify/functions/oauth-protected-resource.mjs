/**
 * Netlify Function: oauth-protected-resource (RFC 9728)
 * Port of api/oauth-protected-resource.js for dual-deploy.
 */

const ALLOWED_HOSTS = new Set([
  'mohamed-tarek-abdelhady.vercel.app',
  'website-mohamed.vercel.app',
  'eng-mta.netlify.app',
]);

function safeHost(raw) {
  const candidate = String(raw || '').split(',')[0].trim().toLowerCase();
  return ALLOWED_HOSTS.has(candidate) ? candidate : 'eng-mta.netlify.app';
}

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
  const host = safeHost(
    req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host
  );
  const base = `https://${host}`;

  return new Response(
    JSON.stringify({
      resource: base,
      resource_name: 'Mohamed Tarek Abdelhady Portfolio',
      resource_documentation: `${base}/services.html`,
      authorization_servers: [base],
      scopes_supported: ['read', 'tools'],
      bearer_methods_supported: ['header'],
    }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
