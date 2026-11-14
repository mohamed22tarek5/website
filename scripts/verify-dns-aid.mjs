#!/usr/bin/env node

/**
 * DNS for AI Discovery (DNS-AID) Verifier
 * Compliant with draft-mozleywilliams-dnsop-dnsaid and RFC 9460.
 *
 * Queries DoH resolvers (Cloudflare and Google DNS) with DNSSEC enabled (DO=1)
 * to test if an agent discovery zone is published and authenticated.
 *
 * Usage:
 *   node scripts/verify-dns-aid.mjs <domain>
 *
 * Example:
 *   node scripts/verify-dns-aid.mjs mohamedtarek.dev
 */

const targetDomain = process.argv[2] || 'mohamed-tarek-abdelhady.vercel.app';

console.log(`\n=========================================================`);
console.log(`🔍 DNS-AID Verification for: ${targetDomain}`);
console.log(`=========================================================\n`);

const queries = [
  { name: `_index._agents.${targetDomain}`, type: 'HTTPS' },
  { name: `_index._agents.${targetDomain}`, type: 'SVCB' },
  { name: `_a2a._agents.${targetDomain}`, type: 'SVCB' },
  { name: `_mcp._agents.${targetDomain}`, type: 'SVCB' },
  { name: `_index._agents.${targetDomain}`, type: 'TXT' }
];

async function queryDoH(url) {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/dns-json' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

let allPassed = true;
let dnssecValidated = false;

for (const q of queries) {
  const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(q.name)}&type=${q.type}&do=1`;
  let data = await queryDoH(cfUrl);

  if (!data || data.error || data.Status === 2) {
    // Fallback to Google DoH
    const googleUrl = `https://dns.google/resolve?name=${encodeURIComponent(q.name)}&type=${q.type}&do=1`;
    data = await queryDoH(googleUrl);
  }

  const status = data ? data.Status : -1;
  const isNoError = status === 0;
  const hasAnswer = data && Array.isArray(data.Answer) && data.Answer.length > 0;
  const isAd = Boolean(data && data.AD);

  if (isAd) dnssecValidated = true;

  if (isNoError && hasAnswer) {
    console.log(`✅ [FOUND] ${q.type} ${q.name}`);
    console.log(`   DNSSEC Authenticated Data (AD): ${isAd ? 'YES (Valid)' : 'NO (Unsigned)'}`);
    data.Answer.forEach(ans => {
      console.log(`   Answer (TTL ${ans.TTL}): ${ans.data}`);
    });
  } else {
    console.log(`❌ [NOT FOUND] ${q.type} ${q.name} (Status code: ${status})`);
  }
}

console.log(`\n---------------------------------------------------------`);
console.log(`DNSSEC Zone Status: ${dnssecValidated ? '✅ Validated' : '⚠️ Not Signed / Not Authenticated'}`);
if (targetDomain.endsWith('.vercel.app')) {
  console.log(`\n📌 NOTE: Subdomains on *.vercel.app do not permit custom DNS`);
  console.log(`   records because Vercel controls the vercel.app zone.`);
  console.log(`   To publish DNS-AID records, add a custom domain (e.g. mohamedtarek.dev)`);
  console.log(`   and configure the records in Cloudflare or your DNS provider.`);
  console.log(`   Refer to dns-aid.zone for ready-to-use record templates.`);
}
console.log(`---------------------------------------------------------\n`);
