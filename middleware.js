import { htmlToMarkdown, estimateTokens } from './html-to-markdown.js';

export const config = {
  matcher: [
    '/((?!api/|_next/|static/|favicon\\.ico|icon\\.png|icon-192\\.png|icon-512\\.png|apple-touch-icon\\.png|photo\\.jpg|manifest\\.webmanifest|sw\\.js|pwa\\.js|common\\.js|common\\.css|.*\\.xml|.*\\.json$|.*\\.txt$|.*\\.css$|.*\\.js$|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|.*\\.woff$|.*\\.woff2$|.*\\.ttf$|.*\\.eot$).*)'
  ]
};

export default function middleware(request) {
  const accept = request.headers.get('accept') || '';

  // Pass through non-markdown requests
  if (!accept.includes('text/markdown')) {
    return;
  }

  // Prevent infinite loop from internal fetch
  if (request.headers.get('x-md-internal') === '1') {
    return;
  }

  const url = new URL(request.url);

  // Only handle HTML page requests (skip files with extensions)
  const pathParts = url.pathname.split('.');
  if (pathParts.length > 1) {
    const ext = pathParts[pathParts.length - 1].toLowerCase();
    if (['xml', 'json', 'txt', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'webmanifest'].includes(ext)) {
      return;
    }
  }

  // Fetch the original HTML with internal marker to prevent loop
  const internalHeaders = new Headers(request.headers);
  internalHeaders.set('x-md-internal', '1');

  const originalRequest = new Request(request.url, {
    method: request.method,
    headers: internalHeaders
  });

  return fetch(originalRequest).then(response => {
    if (!response.ok) {
      return response;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    return response.text().then(html => {
      const markdown = htmlToMarkdown(html);
      const tokens = estimateTokens(markdown);

      return new Response(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'x-markdown-tokens': String(tokens),
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*'
        }
      });
    });
  });
}
