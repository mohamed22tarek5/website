/**
 * Vercel Routing Middleware
 *
 * Implements content negotiation for AI agents ("Markdown for Agents")
 * per https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 * and https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
 *
 * Runs before static file caching and serverless functions.
 * When a request has `Accept: text/markdown`, rewrites the request
 * to /api/markdown?path=<pathname> so the agent receives Markdown.
 */

// File extensions that should never be rewritten to markdown
const STATIC_ASSET_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|woff2?|ttf|eot|pdf|json|webmanifest|xml|txt|map)$/i;

export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Never intercept static assets (images, fonts, stylesheets, scripts, documents)
  if (STATIC_ASSET_EXTENSIONS.test(pathname)) {
    return;
  }

  // Never intercept internal API or health endpoints
  if (pathname.startsWith('/api/')) {
    return;
  }

  const accept = request.headers.get('accept') || '';

  // Check for Markdown content negotiation
  if (accept.includes('text/markdown')) {
    const targetUrl = new URL('/api/markdown', request.url);
    targetUrl.searchParams.set('path', pathname);

    // Vercel edge rewrite header
    return new Response(null, {
      status: 200,
      headers: {
        'x-middleware-rewrite': targetUrl.toString(),
        'Vary': 'Accept'
      }
    });
  }

  // Allow standard browser requests to proceed to static HTML
  return;
}

export const config = {
  // Run middleware on root, html pages, and directory paths, skipping static chunks
  matcher: [
    '/',
    '/:slug*',
    '/sites/:slug*'
  ]
};
