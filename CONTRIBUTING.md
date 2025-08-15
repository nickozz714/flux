# Contributing

Thanks for considering a contribution to **Flux**!  
Your help keeps this project clean, modular, and flexible for real-world multi-site Docker setups.

---

## 📦 Development setup

You can develop Flux on **Linux** or **macOS**, but most production deployments run on Linux.  
Make sure you have:

- **Linux** or **macOS**
- **Docker** (20.x+) + **Docker Compose plugin**
- `jq` (1.6+)
- `bash` (4.x+)
- `shellcheck` (optional, for linting shell scripts)
- `shfmt` (optional, for formatting shell scripts)
- `nodejs` + `npm` (optional, for Web UI development)

Clone your fork and create a working branch:

```bash
git clone https://github.com/<your-username>/flux.git
cd flux
git checkout -b feat/my-feature
```

---

## 🛠 Development commands

Run static checks before committing:

```bash
make lint        # shellcheck + shfmt
make test-json   # validate JSON templates/configs
```

If you don’t have `make` installed, you can run the commands manually:

```bash
find . -type f -name "*.sh" -exec shellcheck {} +
shfmt -d .
jq empty templates/*.json
```

---

## 🚦 Testing

You can test Flux commands without touching your production server:

```bash
export FLUX_CONFIG=$PWD/dev-config.json
sudo install -m 755 bin/flux /usr/local/bin/flux
flux --version
```

Use `BASE_DIR` in `dev-config.json` to point to a test directory, e.g.:

```json
{
  "homeDir": "/tmp/flux-dev",
  "repoDir": "/path/to/flux"
}
```

For the Web UI, you can run locally:

```bash
cd web/flux-web
npm install
npm start
```

---

## 💬 Commit style

We follow **Conventional Commits** for clarity and changelog generation:

- `feat:` – new feature
- `fix:` – bug fix
- `docs:` – documentation changes
- `chore:` – housekeeping tasks
- `refactor:` – non-functional code improvements

Example:

```
feat(scaffold): add support for php-enabled static sites
```

---

## 📜 Pull requests

- Keep PRs focused on **one logical change**.
- Include **before/after** context if changing behavior.
- Update documentation/templates where needed.
- Run `make lint` and `make test-json` before submitting.

---

## 📄 License

By contributing, you agree that your work will be licensed under the [MIT License](LICENSE).
