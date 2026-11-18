/**
 * Netlify Function: agent-identity-claim
 * Port of api/agent/identity/claim.js for dual-deploy.
 * POST /api/agent/identity/claim -> /.netlify/functions/agent-identity-claim
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ALLOWED_RESOURCES = new Set([
  'https://mohamed-tarek-abdelhady.vercel.app',
  'https://website-mohamed.vercel.app',
  'https://eng-mta.netlify.app',
]);
const MAX_BODY_BYTES = 16 * 1024;
const MAX_ASSERTION_LENGTH = 4096;

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

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store',
  };
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const badRequest = (error, error_description, status = 400) =>
    new Response(JSON.stringify({ error, error_description }), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    });

  let body = {};
  try {
    const rawText = await req.text();
    if (Buffer.byteLength(rawText, 'utf-8') > MAX_BODY_BYTES) {
      return badRequest('payload_too_large', 'Request body exceeds 16 KB limit', 413);
    }
    body = rawText ? JSON.parse(rawText) : {};
  } catch {
    return badRequest('invalid_request', 'Malformed JSON body', 400);
  }

  const { grant_type, assertion, resource } = body;

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
  return new Response(
    JSON.stringify({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'read',
    }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
