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
public class DeviceMaintenanceLogDTO {
    private Long id;
    private String terminalId;
    private String terminalName;
    private String actionType;
    private String command;
    private String commandResult;
    private String executedBy;
    private String status;
    private String createdAt;
    private String completedAt;
}
