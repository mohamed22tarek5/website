import fs from 'fs';
import path from 'path';

const sites = fs.readdirSync('public/sites').filter(f => f.endsWith('.html'));
const redirects = [];
const realTools = [];

sites.forEach(f => {
  const content = fs.readFileSync(path.join('public/sites', f), 'utf8');
  if (content.includes('http-equiv="refresh"')) {
    redirects.push(f);
  } else {
    realTools.push(f);
  }
});

console.log('Real tools count:', realTools.length);
console.log('Redirects count:', redirects.length);
console.log('Redirects:', redirects);
console.log('Real tools:', realTools.sort());
