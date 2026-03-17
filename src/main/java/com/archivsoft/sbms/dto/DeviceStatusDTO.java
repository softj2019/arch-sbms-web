package com.archivsoft.sbms.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceStatusDTO {
    private String terminalId;
    private String terminalName;
    private String mainCtlStatus;
    private String cv2FfmpegStatus;
    private String gitVersion;
    private Integer lastDetectionCount;
    private String lastDetectionTime;
    private String stompConnected;
    private Long uptime;
    private String lastOverviewAt;
}
