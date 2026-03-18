#!/usr/bin/env python3
"""
일일 유지보수 리포트 에이전트
매일 07:00 실행 - Pi 헬스 데이터 집계 → GitHub Issue 자동 생성

기능:
1. tb_device_maintenance_log에서 BOOT_REPORT + DAILY_HEALTH 집계
2. 이상 Pi 자동 감지 (서비스 다운, 디스크 부족, 에러 급증)
3. GitHub Issue 자동 생성 (이슈화)
4. 이전 이슈 자동 클로즈 (해결 확인 시)
"""
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta

import paramiko

# --- 설정 ---
SERVER_HOST = "10.10.10.11"
SERVER_PORT = 10022
SERVER_USER = "ncloud"
SERVER_PASS = "Archiv1!"
MYSQL_CMD = "mysql -h 10.10.10.11 -u sbms -p'Gunpo1212!Q' sbms -N"

GH_TOKEN = os.getenv("GH_TOKEN", "")
GH_REPO = os.getenv("GH_REPO", "softj2019/arch-sbms-web")
GH_API = f"https://api.github.com/repos/{GH_REPO}"

ALL_TERMINALS = [
    "26019","26023","26030","26037","26039","26058","26063","26073","26074","26082",
    "26084","26176","26200","26201","26225","26227","26238","26240","26243","26249",
    "26257","26366","26399","26416","26417"
]


def ssh_query(sql):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER_HOST, port=SERVER_PORT, username=SERVER_USER, password=SERVER_PASS, timeout=15)
    stdin, stdout, stderr = client.exec_command(f'{MYSQL_CMD} -e "{sql}"', timeout=15)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    client.close()
    return out


def gh_api(method, path, data=None):
    url = f"{GH_API}{path}" if path.startswith("/") else path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method, headers={
        "Authorization": f"Bearer {GH_TOKEN}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()[:200]}


def collect_report():
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    report = {
        "date": today,
        "boot_reports": [],
        "health_reports": [],
        "missing_boot": [],
        "issues": [],
    }

    # 1. 오늘 BOOT_REPORT 수집
    boot_data = ssh_query(
        f"SELECT terminal_id, status, LEFT(command_result,200), created_at "
        f"FROM tb_device_maintenance_log "
        f"WHERE action_type='BOOT_REPORT' AND created_at >= '{today} 00:00:00' "
        f"ORDER BY terminal_id"
    )
    boot_terminals = set()
    for line in boot_data.split('\n') if boot_data else []:
        parts = line.split('\t')
        if len(parts) >= 4:
            tid = parts[0].strip()
            boot_terminals.add(tid)
            report["boot_reports"].append({
                "terminal_id": tid,
                "status": parts[1].strip(),
                "result": parts[2].strip(),
                "time": parts[3].strip(),
            })

    # 부팅 리포트 누락 Pi
    report["missing_boot"] = [t for t in ALL_TERMINALS if t not in boot_terminals]

    # 2. DAILY_HEALTH 수집
    health_data = ssh_query(
        f"SELECT terminal_id, status, command_result, created_at "
        f"FROM tb_device_maintenance_log "
        f"WHERE action_type='DAILY_HEALTH' AND created_at >= '{today} 00:00:00' "
        f"ORDER BY terminal_id"
    )
    for line in health_data.split('\n') if health_data else []:
        parts = line.split('\t')
        if len(parts) >= 4:
            report["health_reports"].append({
                "terminal_id": parts[0].strip(),
                "status": parts[1].strip(),
                "result": parts[2].strip(),
                "time": parts[3].strip(),
            })

    # 3. 최근 24시간 overview 수신 현황
    overview_data = ssh_query(
        f"SELECT terminal_id, COUNT(*) as cnt, MAX(regist_date) as last "
        f"FROM tb_monitoring "
        f"WHERE regist_date >= NOW() - INTERVAL 1 HOUR "
        f"GROUP BY terminal_id ORDER BY terminal_id"
    )
    active_terminals = set()
    for line in overview_data.split('\n') if overview_data else []:
        parts = line.split('\t')
        if len(parts) >= 1:
            active_terminals.add(parts[0].strip())

    report["no_overview"] = [t for t in ALL_TERMINALS if t not in active_terminals]

    # 4. 이슈 감지
    # BOOT_REPORT FAILED
    for br in report["boot_reports"]:
        if br["status"] == "FAILED":
            report["issues"].append(f"🔴 {br['terminal_id']}: 부팅 후 서비스 비정상 ({br['result'][:80]})")

    # 부팅 리포트 누락 (reboot 안 됨 또는 boot_report 실패)
    if report["missing_boot"]:
        report["issues"].append(f"⚠️ 부팅 리포트 미수신: {', '.join(report['missing_boot'])}")

    # overview 미수신
    if report["no_overview"]:
        report["issues"].append(f"🔴 STOMP 데이터 미수신 (1시간): {', '.join(report['no_overview'])}")

    # DAILY_HEALTH FAILED
    for hr in report["health_reports"]:
        if hr["status"] == "FAILED":
            try:
                detail = json.loads(hr["result"])
                health = detail.get("health", "?")
                report["issues"].append(f"⚠️ {hr['terminal_id']}: 헬스체크 {health}")
            except:
                report["issues"].append(f"⚠️ {hr['terminal_id']}: 헬스체크 FAILED")

    return report


def generate_markdown(report):
    today = report["date"]
    md = f"## 일일 유지보수 리포트 - {today}\n\n"

    # 요약
    total = len(ALL_TERMINALS)
    boot_ok = sum(1 for br in report["boot_reports"] if br["status"] == "SUCCESS")
    boot_fail = sum(1 for br in report["boot_reports"] if br["status"] == "FAILED")
    boot_missing = len(report["missing_boot"])
    no_data = len(report["no_overview"])

    md += "### 요약\n"
    md += f"| 항목 | 값 |\n|------|-----|\n"
    md += f"| 전체 Pi | {total}대 |\n"
    md += f"| 부팅 정상 | {boot_ok}대 |\n"
    md += f"| 부팅 실패 | {boot_fail}대 |\n"
    md += f"| 부팅 미보고 | {boot_missing}대 |\n"
    md += f"| 데이터 미수신 | {no_data}대 |\n"
    md += f"| 이슈 | {len(report['issues'])}건 |\n\n"

    # 이슈
    if report["issues"]:
        md += "### 감지된 이슈\n"
        for issue in report["issues"]:
            md += f"- {issue}\n"
        md += "\n"
    else:
        md += "### 이슈 없음 ✅\n\n"

    # 부팅 리포트 상세
    if report["boot_reports"]:
        md += "### 부팅 리포트\n"
        md += "| Pi | 상태 | 시간 | 상세 |\n|---|---|---|---|\n"
        for br in report["boot_reports"]:
            md += f"| {br['terminal_id']} | {br['status']} | {br['time']} | {br['result'][:60]} |\n"
        md += "\n"

    # 미보고 Pi
    if report["missing_boot"]:
        md += f"### 부팅 리포트 미수신\n{', '.join(report['missing_boot'])}\n\n"

    md += "---\n*Generated by SBMS Daily Report Agent*\n"
    return md


def create_github_issue(report, markdown):
    today = report["date"]
    has_issues = len(report["issues"]) > 0

    title = f"[일일리포트] {today} - {'⚠️ 이슈 감지' if has_issues else '✅ 정상'}"
    labels = ["daily-report"]
    if has_issues:
        labels.append("maintenance")

    result = gh_api("POST", "/issues", {
        "title": title,
        "body": markdown,
        "labels": labels,
    })

    if "number" in result:
        print(f"GitHub Issue 생성: #{result['number']} {result['html_url']}")
        return result["number"]
    else:
        print(f"Issue 생성 실패: {result}")
        return None


def close_resolved_issues():
    """이전 일일리포트에서 이슈가 있었지만 오늘 해결된 경우 클로즈"""
    issues = gh_api("GET", "/issues?labels=daily-report,maintenance&state=open&per_page=10")
    if isinstance(issues, list):
        for issue in issues:
            title = issue.get("title", "")
            if "[일일리포트]" in title and datetime.now().strftime("%Y-%m-%d") not in title:
                gh_api("PATCH", f"/issues/{issue['number']}", {
                    "state": "closed",
                    "state_reason": "completed",
                })
                gh_api("POST", f"/issues/{issue['number']}/comments", {
                    "body": "새 일일리포트가 생성되어 자동 클로즈합니다."
                })
                print(f"Issue #{issue['number']} 자동 클로즈")


def main():
    print(f"=== SBMS 일일 리포트 에이전트 ===")
    print(f"시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    report = collect_report()
    markdown = generate_markdown(report)

    print(markdown)

    issue_num = create_github_issue(report, markdown)
    if issue_num:
        close_resolved_issues()

    print("=== 완료 ===")


if __name__ == "__main__":
    main()
