# auth.md

You are an agent. This service supports **agentic registration**: discover → register → exchange for an access_token → call API. Follow the steps in order.

This service is `https://mohamedtarek.vercel.app` (resource server) and `https://mohamedtarek.vercel.app` (authorization server). All content is publicly accessible — no authentication required.

## Step 1 — Discover

### 1a. Fetch the Protected Resource Metadata

```http
GET /.well-known/oauth-protected-resource
```

Response:

```json
{
  "resource": "https://mohamedtarek.vercel.app",
  "resource_name": "Mohamed Tarek Portfolio",
  "authorization_servers": ["https://mohamedtarek.vercel.app"],
  "scopes_supported": ["read", "tools"],
  "bearer_methods_supported": ["header"]
}
```

### 1b. Fetch the Authorization Server metadata

```http
GET /.well-known/oauth-authorization-server
```

Response includes standard OAuth fields plus the `agent_auth` block:

```json
{
  "issuer": "https://mohamedtarek.vercel.app",
  "token_endpoint": "https://mohamedtarek.vercel.app/oauth2/token",
  "revocation_endpoint": "https://mohamedtarek.vercel.app/oauth2/revoke",
  "grant_types_supported": ["urn:ietf:params:oauth:grant-type:jwt-bearer"],
  "agent_auth": {
    "skill": "https://mohamedtarek.vercel.app/auth.md",
    "identity_endpoint": "https://mohamedtarek.vercel.app/agent/identity",
    "identity_types_supported": ["anonymous"]
  }
}
```

## Step 2 — Pick a method

This service supports **anonymous** access. No credentials or registration needed — all endpoints are publicly accessible.

For authenticated access (optional), use the anonymous flow below.

## Step 3 — Register (optional)

Anonymous registration returns a pre-signed identity assertion:

```http
POST /agent/identity
Content-Type: application/json

{ "type": "anonymous" }
```

Response:

```json
{
  "registration_id": "reg_...",
  "registration_type": "anonymous",
  "identity_assertion": "<service-signed JWT>",
  "assertion_expires": "2026-12-31T23:59:59.000Z",
  "pre_claim_scopes": ["read"]
}
```

## Step 4 — Exchange the assertion (optional)

```http
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<identity_assertion>
&resource=https://mohamedtarek.vercel.app
```

Response:

```json
{
  "access_token": "<token>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read"
}
```

## Step 5 — Use the access_token

```http
GET /sites/
Authorization: Bearer <access_token>
```

## Errors

| Code | Where | What to do |
|------|-------|------------|
| `invalid_request` | `/agent/identity` | Fix the request body |
| `invalid_grant` | `/oauth2/token` | Re-register at Step 3 |

## Contact

- **GitHub**: [MohamedTarek20](https://github.com/MohamedTarek20)
- **LinkedIn**: [Mohamed Tarek](https://www.linkedin.com/in/mohamedtarek20)
