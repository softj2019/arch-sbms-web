package com.archivsoft.sbms.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class CommandDTO {
    private Long    id;          // 아이디(PK)
    private String  shall;     // 쉘 명령어
    private String  createdDate; // 명령어 생성 일자
}
