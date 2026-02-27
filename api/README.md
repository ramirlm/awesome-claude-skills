# Awesome Claude Skills — REST API

A lightweight Node.js/Express REST API that serves metadata and content for the curated Claude Skills collection.

## Quick Start

```bash
cd api
npm install
npm start
```

The server listens on **port 3000** by default (override with `PORT` env var).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/skills` | List all curated skills (id, name, description) |
| `GET` | `/api/skills/:name` | Full detail + Markdown content for one skill |

### Examples

```bash
# List all skills
curl http://localhost:3000/api/skills

# Get a specific skill
curl http://localhost:3000/api/skills/changelog-generator

# Health check
curl http://localhost:3000/health
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `CORS_ORIGIN` | `*` | Restrict to a specific origin (e.g. `https://yourapp.com`) |

## Security

- **Helmet** — sets secure HTTP headers (CSP, HSTS, X-Frame-Options, …)
- **Rate limiting** — 100 requests per 15-minute window per IP
- **Allow-list** — skill names are validated against an explicit allow-list; no dynamic filesystem traversal is possible
- **Read-only** — the API only reads SKILL.md files; no write operations
- **CORS** — configurable; default is open (`*`) for development
