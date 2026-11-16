import fs from 'fs';

const syncCode = fs.readFileSync('scripts/sync-tools.mjs', 'utf8');
const sites = fs.readdirSync('public/sites').filter(f => f.endsWith('.html'));

const realTools = sites.filter(f => {
  const c = fs.readFileSync(`public/sites/${f}`, 'utf8');
  return !c.includes('http-equiv="refresh"');
});

console.log(`Checking ${realTools.length} real tools against sync-tools.mjs:`);
const missing = [];
realTools.forEach(tool => {
  if (!syncCode.includes(tool)) {
    missing.push(tool);
  }
});

if (missing.length === 0) {
  console.log('ALL 40 real tools are in sync-tools.mjs! None missing!');
} else {
  console.log('Missing tools:', missing);
}
