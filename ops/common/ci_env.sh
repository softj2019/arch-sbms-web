#!/usr/bin/env bash
set -euo pipefail

export TZ="${TZ:-Asia/Seoul}"
export LC_ALL="${LC_ALL:-C.UTF-8}"
export LANG="${LANG:-C.UTF-8}"

mkdir -p dist

echo "[ci_env] TZ=${TZ}"
echo "[ci_env] CI_COMMIT_BRANCH=${CI_COMMIT_BRANCH:-}"
