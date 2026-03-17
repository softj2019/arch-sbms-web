#!/usr/bin/env bash
# =============================================================
# 운영서버 Active-Standby 무중단 배포 스크립트
#
# 사용법:
#   bash ops/server-deploy.sh deploy-standby   # Standby 서버에 배포+검증
#   bash ops/server-deploy.sh switch           # Active ↔ Standby 전환
#   bash ops/server-deploy.sh rollback         # 이전 Active로 복귀
#   bash ops/server-deploy.sh status           # 전체 상태 확인
#   bash ops/server-deploy.sh deploy-single <app01|app02>  # 단일 서버 배포
# =============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

INVENTORY="${ROOT_DIR}/ops/inventory/server-inventory.json"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-dev}"
SSH_PASS="${SERVER_SSH_PASS:-Archiv1!}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-30}"
HEALTH_PATH="${HEALTH_PATH:-/login}"

# --- Python helper: SSH 실행 (paramiko) ---
run_on_server() {
  local host="$1" port="$2" user="$3" cmd="$4" timeout="${5:-120}"
  python3 - "$host" "$port" "$user" "$SSH_PASS" "$cmd" "$timeout" <<'PY'
import paramiko, sys
host, port, user, password, cmd, timeout = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5], int(sys.argv[6])
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, port=port, username=user, password=password, timeout=15)
stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
code = stdout.channel.recv_exit_status()
if out.strip():
    print(out.rstrip())
if err.strip():
    for l in err.strip().split('\n'):
        if 'Warning' not in l:
            print(f"STDERR: {l}", file=sys.stderr)
client.close()
sys.exit(code)
PY
}

# --- 인벤토리 파싱 ---
get_server() {
  local server_id="$1"
  python3 - "$INVENTORY" "$server_id" <<'PY'
import json, sys
from pathlib import Path
items = json.loads(Path(sys.argv[1]).read_text())
for s in items:
    if s["id"] == sys.argv[2]:
        print(f'{s["host"]} {s["port"]} {s["user"]} {s["role"]} {s["srcDir"]} {s["appDir"]} {s["releaseRoot"]} {s["servicePort"]} {s["serviceName"]}')
        sys.exit(0)
sys.exit(1)
PY
}

get_by_role() {
  local role="$1"
  python3 - "$INVENTORY" "$role" <<'PY'
import json, sys
from pathlib import Path
items = json.loads(Path(sys.argv[1]).read_text())
for s in items:
    if s["role"] == sys.argv[2]:
        print(s["id"])
        sys.exit(0)
sys.exit(1)
PY
}

# --- 배포 함수 ---
deploy_to() {
  local server_id="$1"
  read -r host port user role srcDir appDir releaseRoot servicePort serviceName <<<"$(get_server "$server_id")"

  echo ""
  echo "===== 배포 시작: ${server_id} (${host}, role=${role}) ====="
  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local release_dir="${releaseRoot}/${DEPLOY_BRANCH}-${ts}"

  # 1. git pull
  echo "[1/5] git pull (${DEPLOY_BRANCH})"
  run_on_server "$host" "$port" "$user" \
    "cd ${srcDir} && git fetch origin && git checkout ${DEPLOY_BRANCH} && git pull origin ${DEPLOY_BRANCH} 2>&1 | tail -5" 120

  local commit
  commit="$(run_on_server "$host" "$port" "$user" "cd ${srcDir} && git log --oneline -1")"
  echo "  commit: ${commit}"

  # 2. 빌드
  echo "[2/5] Gradle 빌드"
  run_on_server "$host" "$port" "$user" \
    "cd ${srcDir} && ./gradlew bootJar 2>&1 | tail -10" 600

  # 3. Release 디렉토리 + jar 배포
  echo "[3/5] Release 배포 (${release_dir})"
  run_on_server "$host" "$port" "$user" \
    "mkdir -p ${release_dir}/logs && cp ${srcDir}/build/libs/*.jar ${release_dir}/app.jar && ln -sfn ${release_dir} ${appDir} && ls -lh ${release_dir}/app.jar"

  # 4. 서비스 재시작
  echo "[4/5] 서비스 재시작 (${serviceName})"
  run_on_server "$host" "$port" "$user" "sudo systemctl restart ${serviceName}" 30 || true

  # 5. 헬스체크
  echo "[5/5] 헬스체크 (최대 ${HEALTH_TIMEOUT}초)"
  local ok=false
  for i in $(seq 1 "$HEALTH_TIMEOUT"); do
    local code
    code="$(run_on_server "$host" "$port" "$user" \
      "curl -s -o /dev/null -w '%{http_code}' http://localhost:${servicePort}${HEALTH_PATH} 2>/dev/null || echo 000")" || true
    if [[ "$code" == "200" || "$code" == "302" ]]; then
      ok=true
      echo "  HTTP ${code} OK (${i}초)"
      break
    fi
    sleep 1
  done

  if [[ "$ok" != "true" ]]; then
    echo "  !! 헬스체크 실패 - 서비스 상태 확인 필요" >&2
    run_on_server "$host" "$port" "$user" "sudo systemctl status ${serviceName} --no-pager -l 2>&1 | tail -15" || true
    return 1
  fi

  echo "===== 배포 완료: ${server_id} (${commit}) ====="
}

# --- 역할 전환 (Active ↔ Standby) ---
switch_roles() {
  local current_active current_standby
  current_active="$(get_by_role active)"
  current_standby="$(get_by_role standby)"

  echo "===== 역할 전환: ${current_active}(Active) → ${current_standby}(Active) ====="

  # 인벤토리 업데이트
  python3 - "$INVENTORY" "$current_active" "$current_standby" <<'PY'
import json, sys
from pathlib import Path
inv_path = Path(sys.argv[1])
items = json.loads(inv_path.read_text())
for s in items:
    if s["id"] == sys.argv[2]:
        s["role"] = "standby"
    elif s["id"] == sys.argv[3]:
        s["role"] = "active"
inv_path.write_text(json.dumps(items, indent=2, ensure_ascii=False))
print(f"전환 완료: {sys.argv[2]}→standby, {sys.argv[3]}→active")
PY
}

# --- 상태 확인 ---
show_status() {
  echo ""
  echo "===== 운영서버 상태 ====="
  python3 - "$INVENTORY" <<'PY'
import json
from pathlib import Path
items = json.loads(Path(__import__("sys").argv[1]).read_text())
for s in items:
    print(f'  {s["id"]:6s}  {s["host"]:15s}  role={s["role"]:8s}  port={s["servicePort"]}')
PY

  for server_id in $(python3 -c "
import json; from pathlib import Path
items = json.loads(Path('${INVENTORY}').read_text())
for s in items: print(s['id'])
"); do
    read -r host port user role srcDir appDir releaseRoot servicePort serviceName <<<"$(get_server "$server_id")"
    echo ""
    echo "  --- ${server_id} (${host}, ${role}) ---"
    run_on_server "$host" "$port" "$user" \
      "echo \"  Branch: \$(cd ${srcDir} && git branch --show-current 2>/dev/null)\"; echo \"  Commit: \$(cd ${srcDir} && git log --oneline -1 2>/dev/null)\"; echo \"  JAR: \$(ls -lh ${appDir}/app.jar 2>/dev/null | awk '{print \$5,\$6,\$7,\$8}')\"; echo \"  Service: \$(systemctl is-active ${serviceName} 2>/dev/null)\"; echo \"  HTTP: \$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${servicePort}${HEALTH_PATH} 2>/dev/null)\"" || true
  done
  echo ""
}

# --- 롤백 ---
rollback_server() {
  local server_id="$1"
  read -r host port user role srcDir appDir releaseRoot servicePort serviceName <<<"$(get_server "$server_id")"

  echo "===== 롤백: ${server_id} ====="
  run_on_server "$host" "$port" "$user" \
    "cd ${releaseRoot} && PREV=\$(ls -1d */ 2>/dev/null | sort | tail -2 | head -1 | tr -d '/') && echo \"이전 릴리스: \${PREV}\" && ln -sfn ${releaseRoot}/\${PREV} ${appDir} && sudo systemctl restart ${serviceName}" 30 || true

  sleep 10
  local code
  code="$(run_on_server "$host" "$port" "$user" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:${servicePort}${HEALTH_PATH}" || echo 000)"
  echo "  헬스체크: HTTP ${code}"
}

# --- 메인 ---
MODE="${1:-status}"
TARGET="${2:-}"

case "$MODE" in
  deploy-standby)
    standby="$(get_by_role standby)"
    deploy_to "$standby"
    ;;
  deploy-single)
    [[ -z "$TARGET" ]] && { echo "usage: $0 deploy-single <app01|app02>" >&2; exit 1; }
    deploy_to "$TARGET"
    ;;
  switch)
    switch_roles
    ;;
  rollback)
    if [[ -n "$TARGET" ]]; then
      rollback_server "$TARGET"
    else
      active="$(get_by_role active)"
      rollback_server "$active"
    fi
    ;;
  status)
    show_status
    ;;
  full-deploy)
    # 무중단 풀 배포: Standby 배포 → 전환
    standby="$(get_by_role standby)"
    deploy_to "$standby"
    echo ""
    read -p "Standby 배포 성공. Active 전환을 진행하시겠습니까? (y/n): " confirm
    if [[ "$confirm" == "y" ]]; then
      switch_roles
      echo "LB 타겟 전환이 필요합니다 (gunpo-lb → 신규 Active)"
    else
      echo "전환 취소. Standby에서 수동 검증 후 switch를 실행하세요."
    fi
    ;;
  *)
    echo "usage: $0 {deploy-standby|deploy-single <id>|switch|rollback [id]|status|full-deploy}" >&2
    exit 1
    ;;
esac
