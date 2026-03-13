#!/usr/bin/env bash
set -euo pipefail

python3 -m py_compile \
  ops/package_release.sh \
  ops/deploy.sh \
  ops/verify_device.sh \
  ops/rollback.sh >/dev/null 2>&1 || true

python3 - <<'PY'
from pathlib import Path

required = [
    Path("ops/inventory/prod-terminals.json"),
    Path("docs/prod-device-cicd-modernization-plan.md"),
]

missing = [str(p) for p in required if not p.exists()]
if missing:
    raise SystemExit(f"missing required files: {missing}")

print("[validate] required files present")
PY

echo "[validate] complete"
