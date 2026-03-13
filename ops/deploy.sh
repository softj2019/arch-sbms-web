#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${ROOT_DIR}/ops/common/inventory.sh"

MODE="${1:-}"
TARGET="${2:-}"
JUMP_HOST="${JUMP_HOST:-192.168.10.107}"
JUMP_USER="${JUMP_USER:-admin}"
DEVICE_USER="${DEVICE_USER:-admin}"

require_inventory

deploy_target() {
  local terminal_id="$1"
  local host="$2"
  echo "[deploy] terminal=${terminal_id} host=${host}"
  echo "[deploy] TODO: upload artifact, switch release symlink, restart services, run post-check"
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
