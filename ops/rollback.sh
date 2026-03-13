#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${ROOT_DIR}/ops/common/inventory.sh"
source "${ROOT_DIR}/ops/common/remote.sh"

MODE="${1:-}"
TARGET="${2:-}"
APP_DIR_DEFAULT="${APP_DIR_DEFAULT:-/home/admin/gunpo}"
RELEASE_ROOT_DEFAULT="${RELEASE_ROOT_DEFAULT:-/home/admin/releases}"

require_inventory

rollback_target() {
  local terminal_id="$1"
  local host="$2"
  echo "[rollback] terminal=${terminal_id} host=${host}"
  local app_dir release_root
  app_dir="$(get_field_by_terminal "$terminal_id" "appDir" || true)"
  release_root="$(get_field_by_terminal "$terminal_id" "releaseRoot" || true)"
  app_dir="${app_dir:-$APP_DIR_DEFAULT}"
  release_root="${release_root:-$RELEASE_ROOT_DEFAULT}"
  device_ssh "$host" "APP_DIR='${app_dir}' RELEASE_ROOT='${release_root}' python3 -" <<'PY'
import json
import shutil
import subprocess
from pathlib import Path

app_dir = Path(__import__("os").environ["APP_DIR"])
release_root = Path(__import__("os").environ["RELEASE_ROOT"])
release_dirs = sorted([p for p in release_root.iterdir() if p.is_dir()], reverse=True)
if not release_dirs:
    raise SystemExit("no release history")

latest = release_dirs[0]
manifest_path = latest / "manifest.json"
backup_dir = latest / "backup"
if not manifest_path.exists() or not backup_dir.exists():
    raise SystemExit("missing rollback metadata")

manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
for relative in manifest.get("files", []):
    backup = backup_dir / relative
    destination = app_dir / relative
    if backup.exists():
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(backup, destination)

for service in manifest.get("services", []):
    subprocess.run(["sudo", "systemctl", "restart", service], check=False)

print(json.dumps({"rolled_back_from": latest.name}, ensure_ascii=False))
PY
}

case "$MODE" in
  single)
    read -r terminal_id host <<<"$(get_target_by_terminal "$TARGET")"
    rollback_target "$terminal_id" "$host"
    ;;
  group)
    while read -r terminal_id host; do
      rollback_target "$terminal_id" "$host"
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
      rollback_target "$terminal_id" "$host"
    done
    ;;
  *)
    echo "usage: $0 {single <terminalId>|group <group>|all}" >&2
    exit 1
    ;;
esac
