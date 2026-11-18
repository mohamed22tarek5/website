/**
 * Netlify Function: agent-identity
 * Port of api/agent/identity.js for dual-deploy.
 * POST /api/agent/identity -> /.netlify/functions/agent-identity
 */

import { createHmac, randomBytes } from 'node:crypto';

const ALLOWED_HOSTS = new Set([
  'mohamed-tarek-abdelhady.vercel.app',
  'website-mohamed.vercel.app',
  'eng-mta.netlify.app',
]);
const MAX_BODY_BYTES = 16 * 1024;

function safeHost(raw) {
  const host = String(raw || '').split(',')[0].trim().toLowerCase();
  return ALLOWED_HOSTS.has(host) ? host : 'eng-mta.netlify.app';
}

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  let body = {};
  try {
    const rawText = await req.text();
    if (Buffer.byteLength(rawText, 'utf-8') > MAX_BODY_BYTES) {
      return new Response(
        JSON.stringify({
          error: 'payload_too_large',
          error_description: 'Request body exceeds 16 KB limit',
        }),
        { status: 413, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }
    body = rawText ? JSON.parse(rawText) : {};
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid_request', error_description: 'Malformed JSON body' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  if (body.type !== 'anonymous') {
    return new Response(
      JSON.stringify({
        error: 'invalid_request',
        error_description: 'Only anonymous registration is supported',
      }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const url = new URL(req.url);
  const host = safeHost(
    req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host
  );
  const issuer = `https://${host}`;

  const registrationId = `reg_${randomBytes(16).toString('hex')}`;
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + 3600 * 24 * 30;
  const assertionExpiry = new Date(expSec * 1000).toISOString();

  const secret = (process.env.AGENT_AUTH_SECRET || '').trim();
  const headerB64 = Buffer.from(
    JSON.stringify({ alg: secret ? 'HS256' : 'none', typ: 'JWT' })
  ).toString('base64url');
  const payloadB64 = Buffer.from(
    JSON.stringify({
      iss: issuer,
      sub: registrationId,
      aud: issuer,
      exp: expSec,
      iat: nowSec,
      type: 'anonymous',
      scopes: ['read'],
    })
  ).toString('base64url');

  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = secret
    ? createHmac('sha256', secret).update(signingInput).digest('base64url')
    : '';
  const identityAssertion = `${signingInput}.${signature}`;

  return new Response(
    JSON.stringify({
      registration_id: registrationId,
      registration_type: 'anonymous',
      identity_assertion: identityAssertion,
      assertion_expires: assertionExpiry,
      pre_claim_scopes: ['read'],
    }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
