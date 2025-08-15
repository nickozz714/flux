# Changelog

## 2025-08-15 — v0.6.1
- Web UI refactor: portable `cmd_web` with self-contained install/development mode.
  - No more hard dependency on `/etc/flux-web` or `/opt/flux-web` — runs from any folder.
  - Automatically creates `server.js`, `etc/config.json`, `etc/catalog.json`, and `web/` if missing.
  - Supports `--path`, `--token`, `--port` for easy local debugging.
  - Can copy existing config/catalog from repo or auto-generate them.
  - Ready for macOS/Linux dev without root.
- Web server improvements:
  - Local `/` endpoint always serves a minimal UI instead of “Cannot GET /”.
  - Added `/api/ping`, `/api/catalog`, `/api/run` endpoints with token auth.
  - `PORT` env var and config overrides supported.
- Prepared for optional auto-generation of `catalog.json` from live `flux catalog-json`.
- NOTE: GUI mechanism exists but is not the primary focus; stability may vary.

## 2025-08-15 — v0.6.0
- Unified `static` and `phpstack` into one flexible static site type:
  - Pure static
  - Static + PHP
  - Static + PHP + DB
- Unified service naming (`${name}-front`, `${name}-api`, `${name}-db`).
- Added safe identifier handling for Compose (`x-` prefix, dots, special chars).
- Default DB engine is MySQL; MariaDB/Postgres optional.
- Healthchecks added for DB services.
- Enhanced `.env` handling with `compose`, `copy`, `template` modes.
- PHP-enabled static sites now auto-mount `.env` files in compose mode.
- Routing rules remain based on `.localHost`/`.domain` (container names unaffected by safe ID conversion).

## 2025-08-11 — v0.5.0 (clean)
- Rebuilt clean tree with explicit `--version`.
- Config-driven `homeDir`/`repoDir` + `flux home` management.
- Dockerfile generator for nginx, caddy, and php-apache.
- `.env` bake-in for static, PHP, and fullstack sites.
- Database ops: create, dump, restore, migrate (direct, ssh, tunnel).
- Added `catalog-json` export and initial Web UI bundle.

## 2025-07-10 — v0.4.0
- Introduced **Flux Web UI** for running commands visually.
- Added `flux web install|uninstall|start|stop|restart|status|open`.
- Configurable via `/etc/flux-web/config.json`.
- Command catalog loaded from `/etc/flux-web/catalog.json`.
- Service installed via systemd on Linux hosts.

## 2025-06-20 — v0.3.0
- Expanded DB tooling: remote migration modes (`ssh`, `tunnel`).
- Added `api-only` and `db-only` scaffold types.
- Improved PHP runtime: base image php-apache with Composer.
- Dotenv handling modes: copy/template/compose.
- `useExternalDbOf` to connect to another site’s internal DB network.

## 2025-05-05 — v0.2.0
- Added **Quick Tunnels** via Cloudflare `trycloudflare.com`.
- Added per-site `internal` networks to isolate DB services.
- `reload-proxy` command to reload nginx config without restart.
- Support for local development domains (`.local`).

## 2025-04-10 — v0.1.0 (initial release)
- Core CLI for multi-site Docker deployments with nginx-proxy + Cloudflare Tunnel.
- Commands: `init`, `add`, `update`, `remove`, `list`, `status`.
- Per-site `docker-compose.yml` generation from JSON configs.
- Automatic nginx vhost rule creation for host-based and path-based routing.
- Firewall management via iptables/ip6tables (`flux firewall`).
- Basic `scaffold` templates for `fullstack` and `static` sites.  
