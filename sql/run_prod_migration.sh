#!/bin/bash
# =====================================================
# 운영 DB 마이그레이션 실행 스크립트
# ncloud 서버(10.10.10.11)에서 직접 실행
#
# 사용법:
#   scp run_prod_migration.sh device_maintenance_migration.sql ncloud@10.10.10.11:/tmp/
#   ssh ncloud@10.10.10.11 -p 10022
#   cd /tmp && bash run_prod_migration.sh
# =====================================================

set -e

MYSQL_HOST="10.10.10.11"
MYSQL_USER="sbms"
MYSQL_PASS="Gunpo1212!Q"
MYSQL_DB="sbms"
SQL_FILE="$(dirname "$0")/device_maintenance_migration.sql"

echo "===== 운영 DB 마이그레이션 시작 ====="
echo "대상: ${MYSQL_HOST}:3306/${MYSQL_DB}"

# 1. 현재 상태 확인
echo ""
echo "[사전 확인] 기존 테이블/메뉴 충돌 체크..."
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" -e "
  SELECT 'tb_device_maintenance_log exists' AS check_item,
         IF(COUNT(*)>0, 'YES (SKIP CREATE)', 'NO (WILL CREATE)') AS result
  FROM information_schema.tables
  WHERE table_schema='$MYSQL_DB' AND table_name='tb_device_maintenance_log'
  UNION ALL
  SELECT 'monitoring/device menu link', IF(COUNT(*)>0, 'YES (SKIP INSERT)', 'NO (WILL INSERT)')
  FROM tb_rmmenulink WHERE link_url='monitoring/device'
  UNION ALL
  SELECT 'MAX menu_link_sno', CAST(COALESCE(MAX(menu_link_sno),0) AS CHAR) FROM tb_rmmenulink
  UNION ALL
  SELECT 'MAX menu_id', CAST(COALESCE(MAX(CAST(menu_id AS UNSIGNED)),0) AS CHAR) FROM tb_rmmenu;
"

echo ""
read -p "계속 진행하시겠습니까? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "취소됨."
  exit 0
fi

# 2. 마이그레이션 실행
echo ""
echo "[실행] 마이그레이션 SQL 적용 중..."
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" < "$SQL_FILE"

# 3. 결과 확인
echo ""
echo "[결과 확인]"
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" -e "
  SHOW CREATE TABLE tb_device_maintenance_log\G
"
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" -e "
  SELECT menu_link_sno, link_nm, link_url FROM tb_rmmenulink WHERE link_url='monitoring/device';
"
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" -e "
  SELECT menu_id, menu_nm, upper_menu_id, menu_link_sno FROM tb_rmmenu WHERE menu_nm='디바이스 관리';
"

echo ""
echo "===== 마이그레이션 완료 ====="
