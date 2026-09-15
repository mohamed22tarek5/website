/**
 * check-parity.js — message catalog key-parity test (Part A, item 7).
 * Usage: node scripts/check-parity.js
 * Fails (exit 1) when any TARGET_LOCALE catalog misses keys present in en.json
 * or contains extra keys. Namespaces: marketing, app, auth, emails, errors.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'i18n');
const BASE = 'en';
const LOCALES = ['ar', 'de', 'fr', 'es'];

function keys(obj, prefix = '') {
  let out = [];
  for (const k of Object.keys(obj).sort()) {
    const p = prefix ? prefix + '.' + k : k;
    if (obj[k] && typeof obj[k] === 'object') out = out.concat(keys(obj[k], p));
    else out.push(p);
  }
  return out;
}

function main() {
  const base = JSON.parse(fs.readFileSync(path.join(DIR, BASE + '.json'), 'utf8'));
  const baseKeys = keys(base);
  let failed = false;
  for (const loc of LOCALES) {
    const file = path.join(DIR, loc + '.json');
    if (!fs.existsSync(file)) {
      console.error(`FAIL: missing catalog ${loc}.json`);
      failed = true;
      continue;
    }
    const cat = JSON.parse(fs.readFileSync(file, 'utf8'));
    const ks = keys(cat);
    const missing = baseKeys.filter((k) => !ks.includes(k));
    const extra = ks.filter((k) => !baseKeys.includes(k));
    // Empty-string guard: every locale must translate (no blank calques shipped silently).
    const empty = [];
    (function walk(o, prefix = '') {
      for (const k of Object.keys(o)) {
        const p = prefix ? prefix + '.' + k : k;
        if (o[k] && typeof o[k] === 'object') walk(o[k], p);
        else if (typeof o[k] !== 'string' || !o[k].trim()) empty.push(p);
      }
    })(cat);
    if (missing.length || extra.length || empty.length) {
      failed = true;
      console.error(`FAIL [${loc}]: missing=${missing.join(',') || '—'} extra=${extra.join(',') || '—'} empty=${empty.join(',') || '—'}`);
    } else {
      console.log(`OK [${loc}]: ${ks.length} keys in parity with en.json`);
    }
  }
  if (failed) {
    console.error('Parity FAILED. Fix catalogs before shipping.');
    process.exit(1);
  }
  console.log('Parity PASSED for all target locales.');
}

main();
