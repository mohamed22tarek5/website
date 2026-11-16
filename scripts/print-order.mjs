import fs from 'fs';

const html = fs.readFileSync('public/index.html', 'utf8');
const cardRegex = /<a href="([^"]+)" class="tool-card reveal" data-category="([^"]+)"[\s\S]*?<h3 class="tool-card-title">([^<]+)<\/h3>/g;

let match;
let i = 1;
while ((match = cardRegex.exec(html)) !== null) {
  console.log(`${i++}. [${match[2]}] ${match[3]} -> ${match[1]}`);
}
