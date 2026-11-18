/**
 * Agent Claim Endpoint
 * POST /api/agent/identity/claim
 *
 * Exchange a valid identity assertion for an anonymous read-only access token.
 * Verifies JWT structure, claims (iss/aud/exp/sub/type), and HMAC-SHA256 signature
 * when AGENT_AUTH_SECRET is configured.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const ALLOWED_RESOURCES = new Set([
  'https://mohamed-tarek-abdelhady.vercel.app',
  'https://website-mohamed.vercel.app',
  'https://eng-mta.netlify.app'
]);
const MAX_BODY_BYTES = 16 * 1024;
const MAX_ASSERTION_LENGTH = 4096;

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

function verifyAssertion(assertion, expectedResource) {
  if (typeof assertion !== 'string' || assertion.length > MAX_ASSERTION_LENGTH) {
    return { ok: false, reason: 'Invalid assertion format' };
  }
  const parts = assertion.split('.');
  if (parts.length !== 3) {
    return { ok: false, reason: 'Malformed JWT assertion' };
  }
  const [headerB64, payloadB64, sigB64] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf-8'));
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
  } catch {
    return { ok: false, reason: 'Invalid JWT encoding' };
  }

  const secret = (process.env.AGENT_AUTH_SECRET || '').trim();
  if (secret) {
    if (!header || header.alg !== 'HS256' || !sigB64) {
      return { ok: false, reason: 'Invalid JWT signature algorithm' };
    }
    const expectedSig = createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest();
    const actualSig = Buffer.from(sigB64, 'base64url');
    if (actualSig.length !== expectedSig.length || !timingSafeEqual(actualSig, expectedSig)) {
      return { ok: false, reason: 'Invalid assertion signature' };
    }
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload || typeof payload.sub !== 'string' || !payload.sub.startsWith('reg_')) {
    return { ok: false, reason: 'Invalid assertion subject' };
  }
  if (payload.type !== 'anonymous') {
    return { ok: false, reason: 'Unsupported assertion type' };
  }
  if (!ALLOWED_RESOURCES.has(payload.iss) || payload.aud !== expectedResource) {
    return { ok: false, reason: 'Assertion issuer or audience mismatch' };
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    return { ok: false, reason: 'Assertion expired' };
  }

  return { ok: true, payload };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

  const { grant_type, assertion, resource } = parsed.data;
  const badRequest = (error, error_description, status = 400) => {
    res.statusCode = status;
    return res.end(JSON.stringify({ error, error_description }));
  };

  if (grant_type !== 'urn:ietf:params:oauth:grant-type:jwt-bearer') {
    return badRequest('unsupported_grant_type', 'Use urn:ietf:params:oauth:grant-type:jwt-bearer');
  }

  if (!assertion) {
    return badRequest('invalid_request', 'assertion is required');
  }

  if (!ALLOWED_RESOURCES.has(resource)) {
    return badRequest('invalid_target', 'Invalid resource');
  }

  const verified = verifyAssertion(assertion, resource);
  if (!verified.ok) {
    return badRequest('invalid_grant', verified.reason, 401);
  }

  const accessToken = `at_${randomBytes(24).toString('hex')}`;

  res.statusCode = 200;
  return res.end(JSON.stringify({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'read'
  }));
}
