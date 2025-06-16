package com.archivsoft.sbms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WifiDTO {
    private String sn; // 시리얼번호
    private String ctn; // ctn
    private String ipAddr; // ip주소
    private String wifiMac; // wifi mac주소
    private String wifiEnabled; // 1(enabled), 2(disabled)
    private String installLoc;
}
