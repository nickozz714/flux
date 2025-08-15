#!/usr/bin/env bash
# deploy-flux.sh — push ./bin/flux to 192.168.2.15 and install it (handles sudo -n / -S cleanly)

set -euo pipefail

# ---- config (override with env vars if you like) ----
HOST="${HOST:-192.168.2.15}"
REMOTE_USER="${REMOTE_USER:-nick}"
LOCAL_FLUX="${LOCAL_FLUX:-./bin/flux}"
REMOTE_REPO_DIR="${REMOTE_REPO_DIR:-/Server/Applications/flux-repo}"
REMOTE_BIN_DIR="${REMOTE_BIN_DIR:-${REMOTE_REPO_DIR}/bin}"
# -----------------------------------------------------

TARGET="${REMOTE_USER}@${HOST}"

[ -f "$LOCAL_FLUX" ] || { echo "❌ Not found: $LOCAL_FLUX"; exit 1; }

echo "➡️  Copying $LOCAL_FLUX -> ${TARGET}:/tmp/flux.new"
scp "$LOCAL_FLUX" "${TARGET}:/tmp/flux.new"

# Remote commands to run as root
REMOTE_CMDS='
set -euo pipefail
REMOTE_REPO_DIR="'"$REMOTE_REPO_DIR"'"
REMOTE_BIN_DIR="'"$REMOTE_BIN_DIR"'"
TS="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$REMOTE_BIN_DIR"

if [ -f "${REMOTE_BIN_DIR}/flux" ]; then
  cp -a "${REMOTE_BIN_DIR}/flux" "${REMOTE_BIN_DIR}/flux.bak.${TS}"
  echo "🗄  Backup: ${REMOTE_BIN_DIR}/flux.bak.${TS}"
fi

mv /tmp/flux.new "${REMOTE_BIN_DIR}/flux"
chmod 0755 "${REMOTE_BIN_DIR}/flux"
echo "✅ Placed: ${REMOTE_BIN_DIR}/flux"

if [ -d /usr/local/bin ] || test -d /usr/local/bin; then
  install -m 0755 "${REMOTE_BIN_DIR}/flux" /usr/local/bin/flux
  DEST=/usr/local/bin/flux
else
  install -m 0755 "${REMOTE_BIN_DIR}/flux" /usr/bin/flux
  DEST=/usr/bin/flux
fi
echo "🔧 Installed: $DEST"

# refresh command caches (harmless if not needed)
if [ -n "${BASH_VERSION:-}" ]; then hash -r || true; fi
if command -v zsh >/dev/null 2>&1; then zsh -lc rehash || true; fi

echo -n "ℹ️  flux version: "; flux --version || true
'

# Try passwordless sudo first
if ssh -o BatchMode=no "${TARGET}" 'sudo -n true' 2>/dev/null; then
  echo "✅ Remote sudo is passwordless."
  ssh -o BatchMode=no "${TARGET}" "sudo -n bash -c $(printf '%q' "$REMOTE_CMDS")"
else
  # Prompt once for sudo password (hidden)
  if [[ -z "${SUDOPASS:-}" ]]; then
    read -r -s -p "Enter sudo password for ${TARGET}: " SUDOPASS
    echo
  fi
  # Feed the password ONLY to sudo via stdin; the script runs via -c (no stdin needed)
  printf '%s\n' "$SUDOPASS" | ssh -o BatchMode=no "${TARGET}" "sudo -S bash -c $(printf '%q' "$REMOTE_CMDS")"
fi

echo "🎉 Done."
