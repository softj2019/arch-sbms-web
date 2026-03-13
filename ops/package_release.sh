#!/usr/bin/env bash
set -euo pipefail

PACKAGE_DIR="${PACKAGE_DIR:-dist}"
PACKAGE_NAME="${PACKAGE_NAME:-sbms-pi}"
RELEASE_SHA="${CI_COMMIT_SHA:-local}"
RELEASE_SHORT_SHA="${CI_COMMIT_SHORT_SHA:-${RELEASE_SHA:0:8}}"
RELEASE_VERSION="${RELEASE_CHANNEL:-prod}-$(date +%Y%m%d)-${RELEASE_SHORT_SHA}"
RELEASE_ROOT="${PACKAGE_DIR}/${RELEASE_VERSION}"
ARCHIVE_PATH="${PACKAGE_DIR}/${PACKAGE_NAME}-${RELEASE_VERSION}.tar.gz"
MANIFEST_PATH="${PACKAGE_DIR}/manifest.json"

mkdir -p "$RELEASE_ROOT"

for item in docker install ops config .gitlab-ci.yml; do
  if [[ -e "$item" ]]; then
    cp -R "$item" "$RELEASE_ROOT/"
  fi
done

python3 - <<PY
import json
from pathlib import Path

manifest = {
    "version": "${RELEASE_VERSION}",
    "git_sha": "${RELEASE_SHA}",
    "generated_at": "$(date -Iseconds)",
    "services": ["main_ctl.service", "wayvnc.service", "gunpo-network-watchdog.service"],
    "files": [
        "docker/main_ctl.py",
        "docker/stomp_rep_client.py",
        "docker/network_probe.py",
        "docker/websocket_endpoint.py",
        "install/git_pull.sh",
    ],
}

Path("${MANIFEST_PATH}").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print("[package] manifest written")
PY

tar -czf "$ARCHIVE_PATH" -C "$PACKAGE_DIR" "$RELEASE_VERSION"

echo "[package] archive=$ARCHIVE_PATH"
echo "[package] manifest=$MANIFEST_PATH"
