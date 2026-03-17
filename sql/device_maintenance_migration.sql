-- =====================================================
-- 디바이스 관리 기능 DB 마이그레이션
-- Phase 2: 신규 테이블 + 메뉴 등록
--
-- !! 충돌 방지: menu_link_sno, menu_id를 MAX+1로 동적 산출
-- !! 개발DB(10.0.0.13)에서 실행 완료 → menu_link_sno=24, menu_id=24
-- !! 운영DB(10.10.10.11)는 ncloud SSH 경유 후 실행
--
-- 실행 방법:
--   (운영) ssh ncloud@10.10.10.11 -p 10022
--          mysql -h 10.10.10.11 -u sbms -p'Gunpo1212!Q' sbms < device_maintenance_migration.sql
--   (개발) mysql -h 10.0.0.13 -u sbms -p'Dkzlqmthvmxm1!' sbms < device_maintenance_migration.sql
-- =====================================================

-- 1. 유지보수 이력 테이블 생성 (이미 존재 시 스킵)
CREATE TABLE IF NOT EXISTS tb_device_maintenance_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    terminal_id     VARCHAR(50)     NOT NULL,
    action_type     VARCHAR(50)     NOT NULL,
    command         TEXT            NOT NULL,
    command_result  TEXT            NULL,
    executed_by     VARCHAR(100)    NOT NULL,
    status          VARCHAR(20)     DEFAULT 'PENDING',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME        NULL,
    INDEX idx_terminal_id (terminal_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 메뉴 링크 등록 (중복 방지 - monitoring/device가 없을 때만)
INSERT INTO tb_rmmenulink (menu_link_sno, menu_div_cd, link_nm, link_url)
SELECT COALESCE(MAX(menu_link_sno), 0) + 1, '2', '디바이스 관리', 'monitoring/device'
FROM tb_rmmenulink
WHERE NOT EXISTS (SELECT 1 FROM tb_rmmenulink WHERE link_url = 'monitoring/device');

-- 3. 메뉴 등록 (시스템 모니터링(id=3) 하위, 중복 방지)
INSERT INTO tb_rmmenu (record_center_id, menu_id, menu_nm, upper_menu_id, menu_div_cd, menu_sort_sno, use_flag, menu_link_sno, menu_grant_levl, work_dtime)
SELECT '0000001',
       CAST(COALESCE(MAX(CAST(m.menu_id AS UNSIGNED)), 0) + 1 AS CHAR),
       '디바이스 관리',
       '3',
       '2',
       3,
       '1',
       (SELECT menu_link_sno FROM tb_rmmenulink WHERE link_url = 'monitoring/device' LIMIT 1),
       '1',
       DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')
FROM tb_rmmenu m
WHERE NOT EXISTS (
    SELECT 1 FROM tb_rmmenu rm
    INNER JOIN tb_rmmenulink rl ON rm.menu_link_sno = rl.menu_link_sno
    WHERE rl.link_url = 'monitoring/device'
);

-- =====================================================
-- Phase 5: tb_monitoring 확장 (Pi 고도화 시점에 실행)
-- =====================================================
-- ALTER TABLE tb_monitoring
--   ADD COLUMN main_ctl_status VARCHAR(20) NULL AFTER vc_power,
--   ADD COLUMN cv2_ffmpeg_status VARCHAR(20) NULL AFTER main_ctl_status,
--   ADD COLUMN git_version VARCHAR(20) NULL AFTER cv2_ffmpeg_status,
--   ADD COLUMN uptime_seconds BIGINT NULL AFTER git_version,
--   ADD COLUMN last_detection_count INT NULL AFTER uptime_seconds,
--   ADD COLUMN last_detection_time VARCHAR(30) NULL AFTER last_detection_count,
--   ADD COLUMN stomp_connected VARCHAR(5) NULL AFTER last_detection_time;
