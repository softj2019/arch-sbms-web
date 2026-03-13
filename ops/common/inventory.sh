#!/usr/bin/env bash
set -euo pipefail

INVENTORY_FILE="${INVENTORY_FILE:-ops/inventory/prod-terminals.json}"

require_inventory() {
  if [[ ! -f "$INVENTORY_FILE" ]]; then
    echo "[inventory] missing inventory file: $INVENTORY_FILE" >&2
    exit 1
  fi
}

list_targets_by_group() {
  local group_name="$1"
  python3 - "$INVENTORY_FILE" "$group_name" <<'PY'
import json
import sys
from pathlib import Path

inventory_path = Path(sys.argv[1])
group_name = sys.argv[2]
items = json.loads(inventory_path.read_text(encoding="utf-8"))
for item in items:
    if item.get("group") == group_name:
        print(f'{item["terminalId"]} {item["host"]}')
PY
}

get_target_by_terminal() {
  local terminal_id="$1"
  python3 - "$INVENTORY_FILE" "$terminal_id" <<'PY'
import json
import sys
from pathlib import Path

inventory_path = Path(sys.argv[1])
terminal_id = sys.argv[2]
items = json.loads(inventory_path.read_text(encoding="utf-8"))
for item in items:
    if item.get("terminalId") == terminal_id:
        print(f'{item["terminalId"]} {item["host"]}')
        sys.exit(0)
sys.exit(1)
PY
}
