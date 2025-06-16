package com.archivsoft.sbms.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class SettingDTO {
    private Long id;            // 시퀀스
    private String description; // 설정 대상
    private String option1;     // 설정내용
    private String value1;      // 설정값
    private String option2;     // 설정내용
    private String value2;      // 설정값
    private String option3;     // 설정내용
    private String value3;      // 설정값
    private String updatedAt;   // 수정일자

    // 조회 전용 변수
    private String optionKey;   // 옵션 키값
    private String setting;     // 설정내용
    private String value;       // 설정값
    private String editorStyle; // select box, text 선택자
    private String t1h;         // 현재 기온
}
