# 공통 장비 배포 고도화 방안

## 배경

현재 정류장 라즈베리파이 계열 장비는 `crontab + install/git_pull.sh` 방식으로 강제 갱신되고 있다.
이 방식은 빠르게 확산시키기에는 편하지만, 운영 중 다음 문제가 반복된다.

- 장비별 브랜치가 `26023`, `26037`처럼 분기되어 공통 수정 전파가 느리다.
- 인증이 없는 장비는 `git fetch` 단계에서 멈추거나 실패한다.
- 배포 실패와 무관하게 `main_ctl`이 재시작되어 장애를 키운다.
- `prod` 공통 수정이 들어가도 장비별로 실제 반영 시점이 다르다.
- 어떤 커밋이 어떤 장비에 배포됐는지 추적이 어렵다.

## 목표

- 공통 변경은 `prod` 브랜치 또는 `prod` 태그 기준으로 모든 장비에 동일하게 배포한다.
- 배포 실패 시 서비스는 유지하고, 성공 시에만 재시작한다.
- 장비별 개별 브랜치 운영을 중단하고 `prod + 장비별 설정` 구조로 단순화한다.
- GitLab 저장소와 연결된 파이프라인으로 배포 이력, 승인, 롤백을 관리한다.
- `main_ctl`, `wayvnc`, watchdog 같은 systemd 동작도 파이프라인에서 제어 가능하게 한다.

## 권장 방향

### 1. 브랜치 전략 단순화

- 공통 코드 배포 기준 브랜치는 `prod` 하나로 통일한다.
- 장비별 차이는 브랜치가 아니라 설정 파일로 분리한다.
- 예시:
  - `config/devices/26023.env`
  - `config/devices/26037.env`
  - `config/devices/26030.env`

장비 식별자는 `TERMINAL_ID`와 호스트명으로 매핑하고, 코드 자체는 `prod`를 그대로 사용한다.

### 2. 크론 기반 강제 배포 폐기

현행:

- `*/10 * * * * sh /home/admin/gunpo/install/git_pull.sh`

개선:

- 크론은 watchdog 유지용으로만 사용
- 코드 배포는 GitLab 파이프라인에서 실행
- 장비에서는 주기적 `git pull`을 하지 않음

권장 크론 역할:

- `ONLY_ENSURE_WATCHDOG=1` 수준의 최소 보정만 수행
- 배포와 서비스 재시작은 파이프라인이 담당

### 3. GitLab CI/CD 중심 배포

GitLab에서는 저장소 파이프라인, downstream pipeline, protected environment, reusable CI/CD component를 지원한다.
공통 배포 파이프라인은 이를 기준으로 설계하는 것이 적합하다.

권장 구조:

1. `build` 단계
2. `package` 단계
3. `deploy:staging-like` 또는 `deploy:group`
4. `deploy:prod`
5. `verify`
6. `rollback`

### 4. 배포 단위 표준화

배포는 `git pull`이 아니라 "릴리즈 아티팩트 배포"로 바꾼다.

권장 배포물:

- 앱 코드 tarball
- `systemd` 유닛 파일
- 장비 공통 스크립트
- 장비별 env 템플릿
- 배포 메타데이터
  - `release_version`
  - `git_sha`
  - `deployed_at`

예시:

```text
artifacts/
  sbms-pi-prod-<sha>.tar.gz
  manifest.json
  services/main_ctl.service
  services/wayvnc.service
```

### 5. 배포 실행 모델

가장 현실적인 모델은 아래 둘 중 하나다.

#### A. Jump Server Push 모델

- GitLab Runner를 점프서버 또는 점프서버 접근 가능한 배포 전용 runner에 둔다.
- 파이프라인이 점프서버를 거쳐 대상 장비로 `scp/rsync + systemctl`을 수행한다.

장점:

- 현재 운영 구조와 가장 가깝다.
- 빠르게 전환 가능하다.

단점:

- 점프서버 의존성이 높다.
- 대상 수가 늘수록 SSH 오케스트레이션이 복잡해진다.

#### B. Device Pull Agent 모델

- 장비는 Git 직접 pull이 아니라, 사내 저장소/패키지/manifest만 조회한다.
- GitLab pipeline은 새 `manifest.json`과 artifact를 배포 저장소에 올린다.
- 장비 agent가 서명 또는 버전을 확인한 뒤 안전하게 적용한다.

장점:

- NAT 환경, 인증 문제, 장비 수 증가에 강하다.
- 롤백과 버전 추적이 더 쉽다.

단점:

- 초기 구현 비용이 더 든다.

### 권장 결론

1차는 `Jump Server Push 모델`,
2차는 `Device Pull Agent 모델`로 가는 2단계 전환이 가장 현실적이다.

## 권장 파이프라인 설계

### Stage 1. Validate

- Python 문법 검사
- 필수 파일 존재 검사
- 장비별 env 스키마 검사
- 변경 영향도 검사
  - `main_ctl.py`
  - `stomp_rep_client.py`
  - `network_probe.py`
  - `websocket_endpoint.py`
  - `install/git_pull.sh`

### Stage 2. Package

- `prod` 기준 tarball 생성
- 배포 manifest 생성
- 릴리즈 버전 태깅

manifest 예시:

```json
{
  "version": "prod-20260313-cec8e1c",
  "git_sha": "cec8e1c",
  "services": ["main_ctl.service", "wayvnc.service"],
  "files": [
    "docker/main_ctl.py",
    "docker/stomp_rep_client.py",
    "docker/network_probe.py",
    "docker/websocket_endpoint.py",
    "install/git_pull.sh"
  ]
}
```

### Stage 3. Deploy

- 배포 대상 그룹 지정
  - `group-a`
  - `group-b`
  - `all-prod`
  - `single-terminal`
- 점프서버 경유 SSH 접속
- 대상 장비에 아티팩트 업로드
- 새 릴리즈 디렉터리 배치
- 심볼릭 링크 전환
- systemd daemon-reload
- `main_ctl`, `wayvnc`, watchdog 재기동 또는 유지

배포 디렉터리 예시:

```text
/home/admin/releases/<version>/
/home/admin/gunpo -> /home/admin/releases/current
```

### Stage 4. Verify

- `systemctl is-active main_ctl.service`
- `systemctl is-active wayvnc.service`
- `/screen_status` 확인
- 최근 `app.err`에서 치명 오류 패턴 확인
- 최근 `app.log`에서 STOMP 연결 확인
- 필요 시 `UP/DOWN/STOP` synthetic check

### Stage 5. Rollback

- 이전 릴리즈 심볼릭 링크 복귀
- 서비스 재기동
- 검증 재실행

## systemd/운영 명령 표준화

파이프라인이 임의 shell을 흩뿌리는 대신, 공통 명령 스크립트를 표준화한다.

예시:

- `ops/deploy.sh`
- `ops/restart_services.sh`
- `ops/verify_device.sh`
- `ops/rollback.sh`

`restart_services.sh` 예시 역할:

- `systemctl daemon-reload`
- `systemctl restart main_ctl.service`
- `systemctl restart wayvnc.service`
- `systemctl restart gunpo-network-watchdog.service`

## 저장소 구조 권장안

```text
.gitlab-ci.yml
ops/
  deploy.sh
  verify_device.sh
  rollback.sh
  inventory/
    prod-terminals.json
config/
  devices/
    26023.env
    26030.env
    26037.env
docker/
install/
```

`inventory/prod-terminals.json` 예시:

```json
[
  { "terminalId": "26023", "host": "10.248.121.141", "group": "prod-a" },
  { "terminalId": "26030", "host": "10.43.20.171", "group": "prod-a" },
  { "terminalId": "26037", "host": "10.135.235.129", "group": "prod-b" }
]
```

## GitLab CI/CD 초안

```yaml
stages:
  - validate
  - package
  - deploy
  - verify
  - rollback

variables:
  PACKAGE_NAME: "sbms-pi"

validate:
  stage: validate
  script:
    - python3 -m py_compile docker/main_ctl.py docker/stomp_rep_client.py docker/network_probe.py docker/websocket_endpoint.py

package_prod:
  stage: package
  script:
    - bash ops/package_release.sh
  artifacts:
    paths:
      - dist/
  rules:
    - if: '$CI_COMMIT_BRANCH == "prod"'

deploy_prod_group_a:
  stage: deploy
  script:
    - bash ops/deploy.sh prod-a
  environment:
    name: production/group-a
  rules:
    - if: '$CI_COMMIT_BRANCH == "prod"'
  when: manual

verify_prod_group_a:
  stage: verify
  script:
    - bash ops/verify_device.sh prod-a
  environment:
    name: production/group-a
```

## 운영 정책 권장

### 1. Protected branch / environment

- `prod`는 protected branch로 설정
- `production/*` 환경은 protected environment로 설정
- 운영 배포 job은 Maintainer 승인 후 수동 실행

### 2. 배포 승인 정책

- `prod` merge
- 자동 validate/package
- 운영 deploy는 manual approval
- verify 성공 시 완료

### 3. 단계적 배포

- `single-terminal`
- `group-a`
- `group-b`
- `all-prod`

처음부터 전체 장비 일괄 배포하지 않고 canary 순서로 진행한다.

## 즉시 실행 가능한 1차 개선안

### Phase 1. 이번 주

- 모든 장비 공통 배포 기준을 `prod`로 통일
- `crontab`의 전체 `git_pull.sh` 실행 제거
- `ONLY_ENSURE_WATCHDOG=1`만 남김
- `prod`용 `git_pull.sh`를 표준화
- `inventory/prod-terminals.json` 작성

### Phase 2. 다음 단계

- 점프서버 경유 GitLab Runner 구축
- `.gitlab-ci.yml` 배포 job 추가
- `ops/deploy.sh`, `ops/verify_device.sh`, `ops/rollback.sh` 추가
- 수동 운영 배포 job 생성

### Phase 3. 안정화

- 장비별 env 분리
- 배포 후 health check 자동화
- 롤백 자동화
- wayvnc/main_ctl/watchdog 공통 재기동 절차 표준화

### Phase 4. 최종 고도화

- Git 직접 pull 제거
- manifest 기반 pull-agent 또는 패키지형 배포 전환
- 릴리즈 단위 이력 관리
- 장비별 배포 현황 대시보드화

## 현재 관찰 기준 우선 조치 대상

- `26037`: 크론 기반 10분 재시작 루프 해소 필요
- `26030`, `26037`: `keepalive ping timeout`, `WAN 401`, `HDMI coroutine` 잔여
- 공통: `prod`는 최신인데 장비별 실제 반영 검증 루틴이 없음

## 권장 결론

공통 변경은 앞으로 `prod` 하나를 기준으로 배포해야 하며, `git_pull.sh`는 더 이상 배포 엔진이 아니라 보조 유지 스크립트로 축소해야 한다.
실제 배포 엔진은 GitLab CI/CD pipeline으로 옮기고, 점프서버는 1차 배포 오케스트레이터로 사용한다.
그 다음 단계에서 장비 pull-agent 구조로 전환하면 장비 수가 늘어나도 안정적으로 운영할 수 있다.
