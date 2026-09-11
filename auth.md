# auth.md

## Agent Authentication — Mohamed Tarek Portfolio

### Agent Audience

This document is for AI agents, automated systems, and MCP clients accessing the Mohamed Tarek Portfolio.

### Registration

No registration is required. All content and tools are publicly accessible without authentication.

### Provisioning

No provisioning needed. Access all endpoints directly via HTTP GET.

### Supported Methods

- **Anonymous access**: No credentials required
- **API Key**: Optional, pass via `Authorization: Bearer <key>` header

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main portfolio homepage |
| `/sites/` | GET | Tools and calculators directory |
| `/.well-known/api-catalog` | GET | API catalog (RFC 9727) |
| `/.well-known/agent-skills/index.json` | GET | Agent skills discovery |
| `/.well-known/mcp/server-card.json` | GET | MCP Server Card |
| `/.well-known/agent-card.json` | GET | A2A Agent Card |
| `/.well-known/ai-catalog.json` | GET | ARD capability manifest |
| `/.well-known/oauth-protected-resource` | GET | OAuth Protected Resource Metadata |
| `/.well-known/oauth-authorization-server` | GET | OAuth Authorization Server Metadata |

### Credential Use

No credentials are needed for public endpoints. All portfolio content, calculators, and tools are freely accessible.

### Contact

For questions or collaboration:

- **GitHub**: [MohamedTarek20](https://github.com/MohamedTarek20)
- **LinkedIn**: [Mohamed Tarek](https://www.linkedin.com/in/mohamedtarek20)

### Content Usage

See `robots.txt` for AI content usage preferences (Content-Signal directives).
