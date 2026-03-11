package com.archivsoft.sbms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TerminalNetworkStatusDTO {
    private String terminalId;
    private Integer networkRetryCount;
    private String networkOutageStartedAt;
    private String networkLastRecoveredAt;
    private String networkLastRebootRequestedAt;
    private Integer networkPendingEventCount;
    private Integer networkRetryIntervalSec;
    private Integer networkRebootThreshold;
    private String networkFailureReason;
    private String networkEventLogsRaw;
    private String networkOutageLogsRaw;
    private String lastOverviewReceivedAt;
    private String createdAt;
    private String updatedAt;
}
