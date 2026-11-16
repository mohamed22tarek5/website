import fs from 'fs';
import path from 'path';

const files = [
  'public/index.html',
  'public/about.html',
  'public/services.html',
  'public/projects.html',
  'public/certificates.html',
  'public/cv.html',
  'public/social-media.html',
  'public/404.html'
];

for (const file of files) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Navigation Link in <nav ... id="navMenu">...</nav>
  const navMatch = content.match(/<nav[^>]*id="navMenu"[^>]*>([\s\S]*?)<\/nav>/i);
  if (navMatch && !navMatch[1].includes('href="/article/"')) {
    let navHtml = navMatch[1];
    if (file === 'public/index.html') {
      navHtml = navHtml.replace(
        /(<a href="#projects" class="nav-link">Projects<\/a>)/i,
        `$1\r\n        <a href="/article/" class="nav-link">M.T.A. Lab</a>`
      );
    } else {
      navHtml = navHtml.replace(
        /(<a href="(?:projects\.html|\/projects\.html)" class="nav-link[^"]*">Projects<\/a>)/i,
        `$1\r\n        <a href="/article/" class="nav-link">M.T.A. Lab</a>`
      );
    }
    content = content.replace(navMatch[1], navHtml);
  } else if (file === 'public/404.html') {
    if (!content.includes('href="/article/"')) {
      content = content.replace(
        /(<a href="\/projects\.html">Projects<\/a>)/i,
        `$1\r\n      <a href="/article/">M.T.A. Lab</a>`
      );
    }
  }

  // 2. Footer Link
  if (!content.includes('M.T.A. Lab &amp; Articles')) {
    content = content.replace(
      /(<a href="\/(?:cv|about|tools)\.html">[^<]+<\/a>\s*<\/div>)/i,
      (match) => {
        return `  <a href="/article/">M.T.A. Lab &amp; Articles</a>\r\n          </div>`;
      }
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Verified/updated navigation in ${file}`);
}
