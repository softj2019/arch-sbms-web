package com.archivsoft.sbms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ControlLogDTO {
    private Long   id;               // 아이디
    private String terminalId;       // 정류장 아이디
    private String deviceName;       // 시설물 이름
    private String action;           // 행위
    private String userId;           // 행위자
    private String createdAt;        // 로그 생성일자
}
