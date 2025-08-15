# Flux — Multi‑site Docker + nginx-proxy + Cloudflare Tunnel

Flux lets you deploy and manage multiple sites on one host using Docker, [`jwilder/nginx-proxy`](https://hub.docker.com/r/jwilder/nginx-proxy), Cloudflare Tunnels, and optional iptables-based isolation.

## Features
- **Single reverse proxy** for many sites (Host-based and path-based routing)
- **Quick Tunnels** for instant testing (no domain required)
- **Per-site internal networks** so databases are never exposed
- **JSON-driven configuration** for sites and firewall rules
- **Simple CLI**: scaffold, add, update, remove, status
- Works **without router port forwards**
- **Static + PHP** support in one template (no separate phpstack type)
- Flexible `.env` handling for frontend services

## Install
```bash
sudo install -m 755 bin/flux /usr/local/bin/flux
hash -r
flux --help
```

## Quick start
```bash
flux init
flux firewall security/firewall.json --persist
flux scaffold fullstack transfer-hub --db mysql --up
flux quick-start transfer-hub
flux quick-url transfer-hub
# Go live later with a permanent tunnel
flux setup-tunnel "<YOUR_TUNNEL_TOKEN>"
```

## Repository Layout
```
bin/flux
templates/
  site-fullstack.template.json
  site-static.template.json
security/firewall.json
examples/sites/
  transfer-hub.json
  nickduchatinier.json
docs/
  QUICKSTART.md
  OPERATIONS.md
.github/workflows/ci.yml
LICENSE
CONTRIBUTING.md
CHANGELOG.md
.editorconfig
.gitattributes
.gitignore
```

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License
MIT — see [LICENSE](LICENSE).

## v0.3.0 additions
- DB operations: create / dump / restore / migrate; migrate-remote direct | ssh | tunnel
- API-only and DB-only scaffolds
- PHP runtime: php-apache + Dockerfile generation
- Dotenv handling: copy / template / compose
- `useExternalDbOf`: connect to another site's internal DB network

## v0.6.0 additions
- Unified service naming: `name-front`, `name-api`, `name-db`
- **Static sites** can now optionally enable PHP and/or DB
- Removed legacy `phpstack` type
- Database engine default is `mysql` (can be overridden)
- Healthchecks added for MySQL/MariaDB/Postgres
- **Safe identifier** handling for Compose (`x-` prefix fix, dots, etc.)
- Improved `.env` mounting for PHP-enabled sites

## Static site modes
A `static` site can now be one of:
1. **Pure static** — served by nginx or caddy
2. **Static + PHP** — Apache+PHP runtime (no DB)
3. **Static + PHP + DB** — PHP runtime with local MySQL/MariaDB/Postgres

Control this via `frontend.php.enabled` in `site-static.template.json`.

Example:
```json
"frontend": {
  "php": {
    "enabled": true,
    "version": "8.2"
  }
},
"db": {
  "engine": "mysql",
  "name": "myphpapp",
  "rootPassword": "ChangeMe!"
}
```

## Dotenv modes
Flux can manage `.env` files for your frontend container:

| Mode       | Behavior |
|------------|----------|
| `""` / `"compose"` | **Default for PHP sites**: Mount all `*.env` in the site folder into `/var/www/<filename>.env` and list them under `env_file` in compose. No rebuild required to change values. |
| `"copy"`   | Copy a single `.env` into the image at build time. Specify `source`, `filename`, `targetDir`. |
| `"template"` | Same as `copy` but run through `envsubst` with variables from `frontend.dotenv.vars`. |

For **pure static** sites, `.env` is usually only relevant if your build step uses it.

## Flux Web UI (v0.4.0)
A small web UI to run any Flux command.

**Install:**
```bash
flux web install
flux web open
```

The UI uses a command catalog. You can also print it from CLI:
```bash
flux catalog-json
```

## Version
Flux **v0.6.0** — check with:
```bash
flux --version
```

## Setup
Install CLI:
```bash
sudo install -m 755 bin/flux /usr/local/bin/flux
```
Configure `/etc/flux/config.json`:
```json
{ "homeDir": "/Server/Applications", "repoDir": "/path/to/repo" }
```
Prepare templates:
```bash
flux home prepare
```
Install Web UI:
```bash
flux web install
flux web open
```
