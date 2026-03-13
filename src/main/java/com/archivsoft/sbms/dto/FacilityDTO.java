package com.archivsoft.sbms.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDTO {
//    terminal 테이블
    private Long t_id;              // 터미널 테이블 PK
    private String terminalName;    // 터미널 이름
    private String delYn;           // 터미널 삭제여부
//    FK
    private String terminalId;      // 터미널 ID
//    devices 테이블
    private Long d_id;              // 디바이스 테이블 PK
    private int deviceSno;          // 디바이스 번호
    private String deviceName;      // 디바이스 이름
    private int hasDevice;          // 보유여부

    @JsonProperty("isTerminalChange")
    boolean isTerminalChange;       // terminal 데이터 변경사항 여부
    @JsonProperty("isDeviceChange")
    boolean isDeviceChange;         // device 데이터 변경사항 여부

    // 보유한 디바이스 목록
    private List<Integer> hasDeviceSnoList;

    /*전체 디바이스 목록 (디바이스 추가시 +1)
     * 1  : 통합제어보드     	(ctlBoard)
     * 2  : 스마트스크린     	(smartscreen)
     * 3  : 재실감지카메라   	(cv)
     * 4  : 승하차알림시스템 	(ledPanel)
     * 5  : 공기질표출장치   	(lcdDisplay)
     * 6  : LTE라우터 		(lteRouter)
     * 7  : 공공WI-FI 		(lteRouter)
     * 8  : LED 전등 		(ledLight)
     * 9  : 냉각FAN 			(fan)
     * */
    private List<Integer> allDeviceSnoList = Arrays.asList(1,2,3,4,5,6,7,8,9);

    /* 디바이스 보유 여부 (1: 보유, 0: 미보유) */
    private Integer ctlBoard;       // 통합제어보드
    private Integer smartscreen;    // 스마트 스크린
    private Integer cv;             // 재실감지카메라
    private Integer ledPanel;       // 승하차알림시스템
    private Integer lcdDisplay;     // 공기질표출장치
    private Integer lteRouter;      // LTE 라우터
    private Integer lteRouter2;     // 공공 WI-FI
    private Integer ledLight;       // LED 전등
    private Integer fan;            // 냉각FAN

    private List<String> terminalIdList; // 체크된 시설물 ID 리스트
    private Integer networkRetryCount;
    private String networkOutageStartedAt;
    private String networkLastRecoveredAt;
    private String networkLastRebootRequestedAt;
    private Integer networkPendingEventCount;
    private Integer networkRetryIntervalSec;
    private Integer networkRebootThreshold;
    private String networkFailureReason;
    private List<NetworkEventLogDTO> networkEventLogs;
    private List<NetworkOutageLogDTO> networkOutageLogs;
}
