#!/usr/bin/env python3
"""운영서버 SSH 경유 DB 마이그레이션 스크립트"""
import paramiko
import sys

SSH_HOST = "10.10.10.11"
SSH_PORT = 10022
SSH_USER = "ncloud"
SSH_PASS = "Archiv1!"

MYSQL_CMD = "mysql -h 10.10.10.11 -u sbms -p'Gunpo1212!Q' sbms"

def ssh_exec(command, desc=""):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS, timeout=15)

    if desc:
        print(f"\n[{desc}]")

    stdin, stdout, stderr = client.exec_command(command, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')

    if out:
        print(out)
    if err and 'Warning' not in err:
        print(f"STDERR: {err}", file=sys.stderr)

    client.close()
    return out

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "check"

    print("=" * 60)
    print(f"운영 DB 마이그레이션 도구 (mode={mode})")
    print("=" * 60)

    # 접속 테스트
    ssh_exec("echo 'SSH 연결 성공'", "SSH 접속 테스트")

    if mode == "check":
        # 현재 테이블 목록
        ssh_exec(f"{MYSQL_CMD} -e 'SHOW TABLES;'", "전체 테이블 목록")

        # tb_device_maintenance_log 존재 여부
        ssh_exec(f"""{MYSQL_CMD} -e "SELECT IF(COUNT(*)>0,'EXISTS','NOT EXISTS') AS status FROM information_schema.tables WHERE table_schema='sbms' AND table_name='tb_device_maintenance_log';" """,
                 "tb_device_maintenance_log 존재 여부")

        # 메뉴 링크 현황
        ssh_exec(f"""{MYSQL_CMD} -e "SELECT menu_link_sno, link_nm, link_url FROM tb_rmmenulink ORDER BY menu_link_sno;" """,
                 "tb_rmmenulink 현황")

        # 메뉴 현황
        ssh_exec(f"""{MYSQL_CMD} -e "SELECT menu_id, menu_nm, upper_menu_id, menu_sort_sno, menu_link_sno FROM tb_rmmenu ORDER BY CAST(menu_id AS UNSIGNED);" """,
                 "tb_rmmenu 현황")

        # tb_monitoring 컬럼
        ssh_exec(f"""{MYSQL_CMD} -e "SHOW COLUMNS FROM tb_monitoring;" """,
                 "tb_monitoring 컬럼")

    elif mode == "migrate":
        # Step 1: 테이블 생성
        sql1 = """CREATE TABLE IF NOT EXISTS tb_device_maintenance_log (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            terminal_id VARCHAR(50) NOT NULL,
            action_type VARCHAR(50) NOT NULL,
            command TEXT NOT NULL,
            command_result TEXT NULL,
            executed_by VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'PENDING',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME NULL,
            INDEX idx_terminal_id (terminal_id),
            INDEX idx_created_at (created_at),
            INDEX idx_action_type (action_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"""

        ssh_exec(f'''{MYSQL_CMD} -e "{sql1}"''', "1/3 tb_device_maintenance_log 생성")

        # Step 2: 메뉴 링크 (중복 방지)
        sql2 = """INSERT INTO tb_rmmenulink (menu_link_sno, menu_div_cd, link_nm, link_url)
        SELECT COALESCE(MAX(menu_link_sno),0)+1, '2', '디바이스 관리', 'monitoring/device'
        FROM tb_rmmenulink t
        WHERE NOT EXISTS (SELECT 1 FROM tb_rmmenulink WHERE link_url='monitoring/device');"""

        ssh_exec(f'''{MYSQL_CMD} -e "{sql2}"''', "2/3 메뉴 링크 등록")

        # Step 3: 메뉴 등록 (중복 방지)
        sql3 = """INSERT INTO tb_rmmenu (record_center_id, menu_id, menu_nm, upper_menu_id, menu_div_cd, menu_sort_sno, use_flag, menu_link_sno, menu_grant_levl, work_dtime)
        SELECT '0000001',
               CAST(COALESCE(MAX(CAST(m.menu_id AS UNSIGNED)),0)+1 AS CHAR),
               '디바이스 관리', '3', '2', 3, '1',
               (SELECT menu_link_sno FROM tb_rmmenulink WHERE link_url='monitoring/device' LIMIT 1),
               '1', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s')
        FROM tb_rmmenu m
        WHERE NOT EXISTS (
            SELECT 1 FROM tb_rmmenu rm
            INNER JOIN tb_rmmenulink rl ON rm.menu_link_sno=rl.menu_link_sno
            WHERE rl.link_url='monitoring/device'
        );"""

        ssh_exec(f'''{MYSQL_CMD} -e "{sql3}"''', "3/3 메뉴 등록")

        # 결과 확인
        ssh_exec(f"""{MYSQL_CMD} -e "SHOW CREATE TABLE tb_device_maintenance_log\\G" """,
                 "결과: 테이블 구조")
        ssh_exec(f"""{MYSQL_CMD} -e "SELECT menu_link_sno, link_nm, link_url FROM tb_rmmenulink WHERE link_url='monitoring/device';" """,
                 "결과: 메뉴 링크")
        ssh_exec(f"""{MYSQL_CMD} -e "SELECT menu_id, menu_nm, upper_menu_id, menu_link_sno FROM tb_rmmenu rm INNER JOIN tb_rmmenulink rl ON rm.menu_link_sno=rl.menu_link_sno WHERE rl.link_url='monitoring/device';" """,
                 "결과: 메뉴")

    print("\n" + "=" * 60)
    print("완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()
