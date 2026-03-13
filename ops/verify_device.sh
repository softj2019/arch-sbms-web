#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${ROOT_DIR}/ops/common/inventory.sh"

MODE="${1:-}"
TARGET="${2:-}"

require_inventory

verify_target() {
  local terminal_id="$1"
  local host="$2"
  echo "[verify] terminal=${terminal_id} host=${host}"
  echo "[verify] TODO: main_ctl / wayvnc / screen_status / app.err health checks"
}

case "$MODE" in
  single)
    read -r terminal_id host <<<"$(get_target_by_terminal "$TARGET")"
    verify_target "$terminal_id" "$host"
    ;;
  group)
    while read -r terminal_id host; do
      verify_target "$terminal_id" "$host"
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
      verify_target "$terminal_id" "$host"
    done
    ;;
  *)
    echo "usage: $0 {single <terminalId>|group <group>|all}" >&2
    exit 1
    ;;
esac
