package com.archivsoft.sbms.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ControlAllowedIpDTO {
    private Integer seq;                // 시퀀스(PK)
    private String description;         // 설명
    private String ip;                  // 허용 IP
    private int useFlag;                // 사용 여부
    private String createUserId;        // 등록자
    private String createdAt;           // 등록 일자
    private String updateUserId;        // 수정자    
    private String updatedAt;           // 수정 일자

    public void normalize() {
        if (this.description != null) this.description = this.description.trim();
        if( this.ip != null) this.ip = this.ip.trim();
    }
}
