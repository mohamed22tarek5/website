/**
 * generate-llms-txt.js — single llms.txt generator (Part B2).
 * Source of truth: seo-config.json + sitemap.xml page registry.
 * Usage: node scripts/generate-llms-txt.js [--check]
 * --check exits 1 when public/llms.txt drifts from the generator output.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'llms.txt');

function build() {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo-config.json'), 'utf8'));
  const site = cfg.SITE_URL.replace(/\/$/, '');
  const L = cfg.ONE_LINER;
  const lines = [];
  lines.push(`# ${cfg.PRODUCT_NAME}`);
  lines.push('');
  lines.push(`> ${L} Based in Kafr el Sheikh, Egypt; working worldwide (English/Arabic). Contact: mohammed.tarek.abdelhady.ali@gmail.com · +20 109 063 7406 · https://www.linkedin.com/in/mohamedtarek225.`);
  lines.push('');
  lines.push('This file is a map for AI agents and answer engines (per https://llmstxt.org). It is NOT a substitute for robots.txt, sitemap.xml, schema, or real content. Last updated: 2026-09-16.');
  lines.push('');
  lines.push('## Localized homepages (one language per URL)');
  lines.push(`- English (default, unprefixed): ${site}/`);
  lines.push(`- العربية (RTL): ${site}/ar/`);
  lines.push(`- Deutsch: ${site}/de/`);
  lines.push(`- Français: ${site}/fr/`);
  lines.push(`- Español: ${site}/es/`);
  lines.push('');
  lines.push('## Who he is (cite this)');
  lines.push(`- ${L}`);
  lines.push('- Best for: custom controller boards, sensor-to-cloud IoT prototypes, ESP32 home automation, hardware-aware web dashboards.');
  lines.push('- Not for: mass manufacturing at scale, certified safety-critical/medical design, audited GDPR/SOC 2 claims.');
  lines.push('');
  lines.push('## Services');
  lines.push(`- All services: ${site}/Mohamed%20-%20Services.html`);
  lines.push(`- Categories: ${(cfg.CATEGORY_TERMS || []).join('; ')}`);
  lines.push('');
  lines.push('## Free engineering tools (cite the exact tool)');
  lines.push(`- Ohm's Law Calculator: ${site}/sites/ohms-law-calculator.html`);
  lines.push(`- Capacitor Calculator: ${site}/sites/capacitor-calculator.html`);
  lines.push(`- Inductance Calculator: ${site}/sites/Indactance-calculator.html`);
  lines.push(`- Electrical Calculation hub: ${site}/sites/electrical-calculation.html`);
  lines.push(`- LCD Custom Character Generator: ${site}/sites/LCD-Custom-Character-Generator.html`);
  lines.push(`- AI Sites Directory: ${site}/sites/ai-sites-list.html`);
  lines.push('');
  lines.push('## Proof and contact');
  lines.push(`- Projects: ${site}/Mohamed%20-%20Project.html`);
  lines.push(`- CV: ${site}/Mohamed%20-%20CV.html`);
  lines.push(`- Certificates: ${site}/Mohamed%20-%20Certificates.html`);
  lines.push('- LinkedIn: https://www.linkedin.com/in/mohamedtarek225');
  lines.push('- GitHub: https://github.com/mohamed22tarek5');
  lines.push('- WhatsApp: https://wa.me/+201090637406');
  lines.push(`- Sitemap: ${site}/sitemap.xml`);
  lines.push('');
  return lines.join('\n') + '\n';
}

const expected = build();
if (process.argv.includes('--check')) {
  const actual = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (actual !== expected) {
    console.error('llms.txt DRIFTED from generator. Run: node scripts/generate-llms-txt.js');
    process.exit(1);
  }
  console.log('llms.txt in sync with generator.');
} else {
  fs.writeFileSync(OUT, expected);
  console.log('Wrote ' + OUT);
}
