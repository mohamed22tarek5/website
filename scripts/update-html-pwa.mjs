import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');
const SITES_DIR = path.join(PUBLIC_DIR, 'sites');

// Collect all HTML files in public and public/sites
function getHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== '.well-known') {
      files = files.concat(getHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = getHtmlFiles(PUBLIC_DIR);
console.log(`Found ${htmlFiles.length} HTML files to inspect and enhance.`);

let updatedCount = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  const isSitesFile = file.includes(path.sep + 'sites' + path.sep);
  const pwaJsSrc = isSitesFile ? '/pwa.js' : '/pwa.js';

  // 1. Ensure viewport-fit=cover
  if (!content.includes('viewport-fit=cover')) {
    if (content.includes('name="viewport" content="width=device-width, initial-scale=1.0"')) {
      content = content.replace(
        'name="viewport" content="width=device-width, initial-scale=1.0"',
        'name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"'
      );
      changed = true;
    } else if (content.includes('name="viewport" content="width=device-width,initial-scale=1.0"')) {
      content = content.replace(
        'name="viewport" content="width=device-width,initial-scale=1.0"',
        'name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"'
      );
      changed = true;
    }
  }

  // 2. Ensure mobile-web-app-capable and apple-mobile-web-app meta tags
  if (!content.includes('name="apple-mobile-web-app-title"')) {
    const pwaMetaBlock = `
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="M. Tarek">
  <meta name="application-name" content="M. Tarek">
  <meta name="msapplication-TileColor" content="#0a0e1a">
  <meta name="msapplication-TileImage" content="/mstile-150x150.png">
  <meta name="msapplication-config" content="/browserconfig.xml">`;

    if (content.includes('name="apple-mobile-web-app-capable"')) {
      // Replace partial block
      content = content.replace(
        /<meta name="apple-mobile-web-app-capable"[^>]*>[\s\S]*?<meta name="mobile-web-app-capable"[^>]*>/i,
        pwaMetaBlock.trim()
      );
      changed = true;
    } else if (content.includes('</head>')) {
      content = content.replace('</head>', `${pwaMetaBlock}\n</head>`);
      changed = true;
    }
  }

  // 3. Ensure favicon.svg and Apple touch icons are linked
  if (!content.includes('favicon.svg') && content.includes('</head>')) {
    const iconTags = `  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">`;
    content = content.replace('</head>', `${iconTags}\n</head>`);
    changed = true;
  }

  // 4. Ensure script /pwa.js is loaded
  if (!content.includes('pwa.js')) {
    if (content.includes('<script src="/common.js"')) {
      content = content.replace('<script src="/common.js"', `<script src="${pwaJsSrc}" defer></script>\n  <script src="/common.js"`);
      changed = true;
    } else if (content.includes('<script src="mta-chrome.js"')) {
      content = content.replace('<script src="mta-chrome.js"', `<script src="${pwaJsSrc}" defer></script>\n  <script src="mta-chrome.js"`);
      changed = true;
    } else if (content.includes('</body>')) {
      content = content.replace('</body>', `  <script src="${pwaJsSrc}" defer></script>\n</body>`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated: ${path.relative(PUBLIC_DIR, file)}`);
  }
}

console.log(`Successfully updated ${updatedCount} HTML files with full PWA & iOS support.`);
