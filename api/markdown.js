/**
 * Markdown for Agents - Content Negotiation
 * Serves markdown versions of pages when Accept: text/markdown is requested.
 *
 * Per RFC 8288 and Cloudflare's Markdown for Agents spec.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  const accept = req.headers.accept || '';

  // Get path from query params (from rewrite) or URL
  const urlPath = req.query.path
    ? '/' + req.query.path
    : req.url.split('?')[0];

  // Check if client wants markdown
  const wantsMarkdown = accept.includes('text/markdown');

  if (wantsMarkdown) {
    // Try to serve pre-generated markdown file
    const mdPath = join(process.cwd(), 'public', `${urlPath}.md`);

    if (existsSync(mdPath)) {
      const content = readFileSync(mdPath, 'utf-8');
      const tokens = content.split(/\s+/).length;

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('x-markdown-tokens', String(tokens));
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return res.status(200).send(content);
    }

    // Fallback: generate minimal markdown from URL path
    const title = urlPath
      .replace(/^\//, '')
      .replace(/\.html$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const fallbackMd = `# ${title}\n\nThis page is part of Mohamed Tarek's portfolio.\n\nVisit [${title}](https://mohamedtarek.vercel.app${urlPath}) for the full experience.\n`;

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('x-markdown-tokens', String(fallbackMd.split(/\s+/).length));
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(200).send(fallbackMd);
  }

  // Default: return instructions
  return res.status(200).json({
    message: 'Markdown for Agents is supported',
    usage: 'Set Accept: text/markdown header to get markdown version',
    example: 'curl -H "Accept: text/markdown" https://mohamedtarek.vercel.app/api/markdown?path=/'
  });
}
