/**
 * Lightweight HTML-to-Markdown converter for Edge Runtime.
 * Handles common HTML elements without external dependencies.
 */
export function htmlToMarkdown(html) {
  let md = html;

  // Remove script, style, nav, footer, header elements
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  md = md.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  md = md.replace(/<header[\s\S]*?<\/header>/gi, '');

  // Remove HTML comments
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');

  // Bold and italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Code blocks
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    return '\n' + content.split('\n').map(line => '> ' + line.trim()).join('\n') + '\n';
  });

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  });

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let i = 0;
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => {
      return `${++i}. $1\n`;
    });
  });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, content) => {
    const rows = [];
    const rowMatches = content.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    if (!rowMatches) return content;

    rowMatches.forEach((row, idx) => {
      const cells = [];
      const cellMatches = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi);
      if (cellMatches) {
        cellMatches.forEach(cell => {
          cells.push(cell.replace(/<[^>]*>/g, '').trim());
        });
      }
      rows.push('| ' + cells.join(' | ') + ' |');
      if (idx === 0) {
        rows.push('| ' + cells.map(() => '---').join(' | ') + ' |');
      }
    });
    return '\n' + rows.join('\n') + '\n';
  });

  // Horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n');

  // Paragraphs and line breaks
  md = md.replace(/<br[^>]*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');

  // Divs and spans - just extract content
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1');
  md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

/**
 * Estimate token count (rough: 1 token ~ 4 chars for English)
 */
export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
