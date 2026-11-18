/**
 * Agent Identity Endpoint
 * POST /api/agent/identity
 *
 * Returns a signed identity assertion for anonymous read-only agents.
 * Configure AGENT_AUTH_SECRET in Vercel environment variables for HMAC-SHA256 signing.
 */

import { createHmac, randomBytes } from 'crypto';

const PRIMARY_HOST = 'mohamed-tarek-abdelhady.vercel.app';
const ALLOWED_HOSTS = new Set([
  PRIMARY_HOST,
  'website-mohamed.vercel.app',
  'eng-mta.netlify.app'
]);
const MAX_BODY_BYTES = 16 * 1024;

function safeHost(raw) {
  const host = String(Array.isArray(raw) ? raw[0] : (raw || ''))
    .split(',')[0]
    .trim()
    .toLowerCase();
  return ALLOWED_HOSTS.has(host) ? host : PRIMARY_HOST;
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve({ ok: true, data: req.body });
    const chunks = [];
    let total = 0;
    let tooLarge = false;
    req.on('data', (c) => {
      total += c.length;
      if (total > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (tooLarge) return resolve({ ok: false, status: 413 });
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return resolve({ ok: true, data: {} });
      try {
        resolve({ ok: true, data: JSON.parse(raw) });
      } catch {
        resolve({ ok: false, status: 400 });
      }
    });
    req.on('error', () => resolve({ ok: false, status: 400 }));
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const parsed = await readJsonBody(req);
  if (!parsed.ok) {
    res.statusCode = parsed.status || 400;
    return res.end(JSON.stringify({
      error: parsed.status === 413 ? 'payload_too_large' : 'invalid_request',
      error_description: parsed.status === 413 ? 'Request body exceeds 16 KB limit' : 'Malformed JSON body'
    }));
  }

  const { type } = parsed.data;
  if (type !== 'anonymous') {
    res.statusCode = 400;
    return res.end(JSON.stringify({
      error: 'invalid_request',
      error_description: 'Only anonymous registration is supported'
    }));
  }

  const registrationId = `reg_${randomBytes(16).toString('hex')}`;
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + 3600 * 24 * 30; // 30 days
  const assertionExpiry = new Date(expSec * 1000).toISOString();

  const issuer = `https://${safeHost(req.headers['x-forwarded-host'] || req.headers.host)}`;
  const secret = (process.env.AGENT_AUTH_SECRET || '').trim();
  const headerB64 = Buffer.from(JSON.stringify({
    alg: secret ? 'HS256' : 'none',
    typ: 'JWT'
  })).toString('base64url');

  const payloadB64 = Buffer.from(JSON.stringify({
    iss: issuer,
    sub: registrationId,
    aud: issuer,
    exp: expSec,
    iat: nowSec,
    type: 'anonymous',
    scopes: ['read']
  })).toString('base64url');

  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = secret
    ? createHmac('sha256', secret).update(signingInput).digest('base64url')
    : '';
  const identityAssertion = `${signingInput}.${signature}`;

  res.statusCode = 200;
  return res.end(JSON.stringify({
    registration_id: registrationId,
    registration_type: 'anonymous',
    identity_assertion: identityAssertion,
    assertion_expires: assertionExpiry,
    pre_claim_scopes: ['read']
  }));
}
