#!/usr/bin/env bash
set -euo pipefail

for script in \
  ops/common/ci_env.sh \
  ops/common/inventory.sh \
  ops/common/remote.sh \
  ops/package_release.sh \
  ops/deploy.sh \
  ops/verify_device.sh \
  ops/rollback.sh; do
  bash -n "$script"
done

python3 - "$PWD" <<'PY'
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
required = [
    root / "ops/inventory/prod-terminals.json",
    root / "docs/prod-device-cicd-modernization-plan.md",
    root / ".gitlab-ci.yml",
]

missing = [str(p) for p in required if not p.exists()]
if missing:
    raise SystemExit(f"missing required files: {missing}")

items = json.loads((root / "ops/inventory/prod-terminals.json").read_text(encoding="utf-8"))
if not items:
    raise SystemExit("inventory is empty")

print("[validate] required files present")
print(f"[validate] inventory_count={len(items)}")
PY

echo "[validate] complete"
