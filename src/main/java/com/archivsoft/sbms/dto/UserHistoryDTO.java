package com.archivsoft.sbms.dto;

import lombok.Data;

@Data
public class UserHistoryDTO {
    private Long id;
    private String userId;
    private String userNm;
    private String clientIp;
    private String action;
    private String createdAt;
    private String visitCount;
}

