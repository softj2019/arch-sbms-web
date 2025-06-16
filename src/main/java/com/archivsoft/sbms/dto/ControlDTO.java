package com.archivsoft.sbms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ControlDTO {
    private int           id;          // 아이디(PK)
    private String        terminalId;  // 정류장 아이디
    private String        deviceName;  // 시설물 이름
    private String        action;      // 행위 내용 (on, off, up, down, stop 등)
    private String        userId;      // 행위자 아이디
    private LocalDateTime createdAt;   // 로그 생성 일자
}
