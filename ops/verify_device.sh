#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${ROOT_DIR}/ops/common/inventory.sh"
source "${ROOT_DIR}/ops/common/remote.sh"

MODE="${1:-}"
TARGET="${2:-}"

require_inventory

verify_target() {
  local terminal_id="$1"
  local host="$2"
  echo "[verify] terminal=${terminal_id} host=${host}"
  device_ssh "$host" "python3 -" <<'PY'
import json
import subprocess
from pathlib import Path

services = ["main_ctl.service", "wayvnc.service", "gunpo-network-watchdog.service"]
service_state = {}
for service in services:
    result = subprocess.run(["systemctl", "is-active", service], capture_output=True, text=True, check=False)
    service_state[service] = result.stdout.strip()

screen_status = "unavailable"
curl = subprocess.run(
    ["curl", "-fsS", "http://localhost:5000/screen_status"],
    capture_output=True,
    text=True,
    check=False,
)
if curl.returncode == 0:
    screen_status = curl.stdout.strip()

app_err = Path("/home/admin/gunpo/docker/logs/app.err")
tail = ""
if app_err.exists():
    tail_result = subprocess.run(
        ["tail", "-n", "80", str(app_err)],
        capture_output=True,
        text=True,
        check=False,
    )
    tail = tail_result.stdout

problem_patterns = [
    "Traceback",
    "ModuleNotFoundError",
    "keepalive ping timeout",
    "No route to host",
]
problems = [pattern for pattern in problem_patterns if pattern in tail]

print(json.dumps({
    "services": service_state,
    "screen_status": screen_status,
    "problems": problems,
}, ensure_ascii=False))

if any(state != "active" for state in service_state.values()):
    raise SystemExit(1)
PY
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
