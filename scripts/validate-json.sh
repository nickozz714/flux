#!/usr/bin/env bash
set -euo pipefail
jq . templates/site-fullstack.template.json >/dev/null
jq . templates/site-static.template.json >/dev/null
jq . security/firewall.json >/dev/null
echo "JSON looks valid."
