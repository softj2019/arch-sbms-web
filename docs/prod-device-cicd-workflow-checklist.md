# Prod 장비 배포 세부 수행계획

## 목적

- 공통 변경사항이 `prod` 브랜치를 통해 모든 장비에 동일하게 반영되도록 한다.
- `git_pull.sh + crontab` 강제 갱신 구조를 점진적으로 축소하고, 저장소 push / merge request / 수동 승인 흐름과 연계된 GitLab CI/CD 파이프라인으로 전환한다.
- 배포 실패 시 장비 서비스는 유지하고, 성공 시에만 서비스 재기동과 검증이 수행되게 한다.

## 워크플로우

### Phase 1. 기준선 정리

- [x] `prod` 브랜치를 공통 배포 기준 브랜치로 확정
- [x] `git_pull.sh`가 `master`가 아니라 현재 브랜치 또는 `prod`를 기준으로 동작하도록 수정
- [x] 인증 실패 시 `git fetch`가 멈추지 않고 즉시 종료되도록 `GIT_TERMINAL_PROMPT=0` 적용
- [x] `applog`가 `app.log`를 가리키도록 수정하고 `apperr` alias 추가
- [x] `26023`, `26037`의 10분 재시작 루프를 `ONLY_ENSURE_WATCHDOG=1` 크론으로 우회
- [ ] `prod` 대상 장비 전체의 `crontab` 현황 수집
- [ ] `prod` 대상 장비 전체의 현재 브랜치 / 커밋 SHA 수집

### Phase 2. 저장소 표준 구조 추가

- [x] `.gitlab-ci.yml` 초안 추가
- [x] `ops/package_release.sh` 추가
- [x] `ops/deploy.sh` 추가
- [x] `ops/verify_device.sh` 추가
- [x] `ops/rollback.sh` 추가
- [x] `ops/inventory/prod-terminals.json` 예시 추가
- [ ] 장비별 env 파일 디렉터리 `config/devices/` 생성
- [ ] 점프서버 경유 배포에 필요한 SSH 비밀값 이름 확정

### Phase 3. 파이프라인 연계

- [ ] GitLab runner 위치 결정
- [ ] 점프서버 직접 runner 설치 여부 결정
- [ ] protected branch: `prod` 적용
- [ ] protected environment: `production/*` 적용
- [ ] `deploy:single`, `deploy:group-a`, `deploy:group-b`, `deploy:all` 수동 승인 정책 설정
- [ ] `merge request -> validate/package`, `prod push -> package/deploy` 규칙 검증

### Phase 4. 배포 자동화 구현

- [ ] `ops/deploy.sh`에 실제 artifact 업로드 구현
- [ ] 점프서버 경유 SSH hop 로직 구현
- [ ] 대상 장비 릴리즈 디렉터리 구조 적용
- [ ] `/home/admin/releases/<version>` 배치 구조 적용
- [ ] `/home/admin/gunpo` 심볼릭 링크 전환 방식 적용
- [ ] systemd daemon-reload / restart 절차 스크립트화
- [ ] 배포 성공 시에만 `main_ctl`, `wayvnc`, watchdog 재기동하도록 구현

### Phase 5. 검증 자동화 구현

- [ ] `ops/verify_device.sh`에 `main_ctl.service` 확인 추가
- [ ] `ops/verify_device.sh`에 `wayvnc.service` 확인 추가
- [ ] `ops/verify_device.sh`에 `/screen_status` 확인 추가
- [ ] `ops/verify_device.sh`에 최근 `app.err` 치명 오류 패턴 검사 추가
- [ ] `ops/verify_device.sh`에 STOMP 연결 로그 검사 추가
- [ ] `UP/DOWN/STOP` synthetic check 필요 여부 결정

### Phase 6. 롤백 구현

- [ ] 이전 릴리즈 심볼릭 링크 복귀 구현
- [ ] 롤백 후 `main_ctl`, `wayvnc` 재기동 구현
- [ ] 롤백 후 검증 절차 재실행 구현
- [ ] 롤백 이력 기록 형식 정의

### Phase 7. 장비 운영 정책 전환

- [ ] 장비별 개별 브랜치 사용 종료 계획 수립
- [ ] `prod + device env` 구조로 운영 표준 전환
- [ ] 신규 장비 onboarding 문서화
- [ ] 장애 시 수동 복구 절차 문서화

## 이벤트 기준 자동 동작 정의

### Push

- [x] `prod` push 시 `validate -> package` 자동 수행되도록 CI 초안 반영
- [ ] `prod` push 시 `deploy:single` 자동 대상 정의 여부 결정
- [ ] `prod` push 시 전체 자동 배포 금지 정책 확정

### Merge Request

- [x] merge request 이벤트에서 파이프라인 시작 규칙 초안 반영
- [ ] merge request 단계에서는 `validate`만 수행하도록 세분화
- [ ] `package/deploy`는 merge 후에만 허용되도록 rules 정교화

### Manual Deploy

- [x] `single`, `group-a`, `group-b`, `all` 수동 job 골격 추가
- [ ] 운영 승인자 지정
- [ ] 배포 전 점검 체크리스트 연결
- [ ] 배포 후 검증 job 자동 연결

### Rollback

- [x] rollback job 골격 추가
- [ ] 특정 terminal 단위 롤백 구현
- [ ] 그룹 단위 롤백 구현
- [ ] 마지막 성공 배포 버전 메타데이터 연결

## 즉시 후속 작업

- [ ] `ops/deploy.sh`에 점프서버 경유 실제 SSH/SCP 로직 구현
- [ ] `ops/verify_device.sh`에 실 서비스 검증 로직 구현
- [ ] `26030`, `26037` 같은 운영 장비를 inventory에 계속 확장
- [ ] `prod` 장비 전체 크론을 watchdog 전용으로 순차 전환
- [ ] `keepalive`, `WAN 401`, `HDMI coroutine` 잔여 이슈를 공통 패치로 계속 정리

## 운영 기준 결론

- [x] 공통 변경은 `prod` 브랜치를 통해 배포한다
- [x] 장비가 주기적으로 코드를 바꾸는 구조는 축소한다
- [x] 저장소 이벤트와 연동된 GitLab CI/CD 파이프라인으로 전환한다
- [ ] 실제 deploy / verify / rollback 스크립트를 운영 수준으로 완성한다
