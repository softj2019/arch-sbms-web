#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${ROOT_DIR}/ops/common/inventory.sh"
source "${ROOT_DIR}/ops/common/remote.sh"

MODE="${1:-}"
TARGET="${2:-}"
PACKAGE_DIR="${PACKAGE_DIR:-dist}"
PACKAGE_NAME="${PACKAGE_NAME:-sbms-pi}"
APP_DIR_DEFAULT="${APP_DIR_DEFAULT:-/home/admin/gunpo}"
RELEASE_ROOT_DEFAULT="${RELEASE_ROOT_DEFAULT:-/home/admin/releases}"
MANIFEST_PATH="${PACKAGE_DIR}/manifest.json"
ARCHIVE_PATH="${PACKAGE_DIR}/${PACKAGE_NAME}-$(python3 - "$MANIFEST_PATH" <<'PY'
import json
import sys
from pathlib import Path
manifest = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
print(manifest["version"])
PY
).tar.gz"

require_inventory

if [[ ! -f "${MANIFEST_PATH}" ]]; then
  echo "[deploy] missing manifest: ${MANIFEST_PATH}" >&2
  exit 1
fi

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
  echo "[deploy] missing archive: ${ARCHIVE_PATH}" >&2
  exit 1
fi

deploy_target() {
  local terminal_id="$1"
  local host="$2"
  local app_dir release_root version
  app_dir="$(get_field_by_terminal "$terminal_id" "appDir" || true)"
  release_root="$(get_field_by_terminal "$terminal_id" "releaseRoot" || true)"
  app_dir="${app_dir:-$APP_DIR_DEFAULT}"
  release_root="${release_root:-$RELEASE_ROOT_DEFAULT}"
  version="$(python3 - "$MANIFEST_PATH" <<'PY'
import json
import sys
from pathlib import Path
manifest = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
print(manifest["version"])
PY
)"

  echo "[deploy] terminal=${terminal_id} host=${host} version=${version}"
  device_scp_to "$ARCHIVE_PATH" "$host" "/tmp/${PACKAGE_NAME}-${version}.tar.gz"
  device_scp_to "$MANIFEST_PATH" "$host" "/tmp/${PACKAGE_NAME}-${version}.manifest.json"
  device_ssh "$host" "APP_DIR='${app_dir}' RELEASE_ROOT='${release_root}' VERSION='${version}' PACKAGE_NAME='${PACKAGE_NAME}' python3 -" <<'PY'
import json
import os
import shutil
import subprocess
import tarfile
from pathlib import Path

app_dir = Path(os.environ["APP_DIR"])
release_root = Path(os.environ["RELEASE_ROOT"])
version = os.environ["VERSION"]
package_name = os.environ["PACKAGE_NAME"]
archive_path = Path(f"/tmp/{package_name}-{version}.tar.gz")
manifest_path = Path(f"/tmp/{package_name}-{version}.manifest.json")

release_dir = release_root / version
payload_dir = release_dir / version
backup_dir = release_dir / "backup"
release_root.mkdir(parents=True, exist_ok=True)
release_dir.mkdir(parents=True, exist_ok=True)

with tarfile.open(archive_path, "r:gz") as tar:
    tar.extractall(release_root)

manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
backup_dir.mkdir(parents=True, exist_ok=True)

for relative in manifest.get("files", []):
    source = payload_dir / relative
    destination = app_dir / relative
    if not source.exists():
        continue
    destination.parent.mkdir(parents=True, exist_ok=True)
    backup_target = backup_dir / relative
    backup_target.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        shutil.copy2(destination, backup_target)
    shutil.copy2(source, destination)

(release_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

for service in manifest.get("services", []):
    subprocess.run(["sudo", "systemctl", "restart", service], check=False)

active = {}
for service in manifest.get("services", []):
    result = subprocess.run(["systemctl", "is-active", service], check=False, capture_output=True, text=True)
    active[service] = result.stdout.strip()

print(json.dumps({"version": version, "active": active}, ensure_ascii=False))
PY
}

case "$MODE" in
  single)
    read -r terminal_id host <<<"$(get_target_by_terminal "$TARGET")"
    deploy_target "$terminal_id" "$host"
    ;;
  group)
    while read -r terminal_id host; do
      deploy_target "$terminal_id" "$host"
    done < <(list_targets_by_group "$TARGET")
    ;;
  all)
    python3 - "$INVENTORY_FILE" <<'PY' | while read -r terminal_id host; do
import json
import sys
from pathlib import Path
items = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
for item in items:
    print(f'{item["terminalId"]} {item["host"]}')
PY
      deploy_target "$terminal_id" "$host"
    done
    ;;
  *)
    echo "usage: $0 {single <terminalId>|group <group>|all}" >&2
    exit 1
    ;;
esac
