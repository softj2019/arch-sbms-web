package com.archivsoft.sbms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ControlMessageDTO {
    private String terminalId;   // 정류장 아이디
    private String terminalName; // 정류장 이름
    private String content;      // 비상메시지 내용
    private String updatedAt;    // 수정일자
    private String editorId;     // 수정자

    // 적용대상 정류장 ID 리스트
    private List<String> terminalIdList;
}
