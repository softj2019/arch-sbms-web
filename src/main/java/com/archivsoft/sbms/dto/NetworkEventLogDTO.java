package com.archivsoft.sbms.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetworkEventLogDTO {
    private Long id;
    private String terminalId;
    private String eventHash;
    @JsonProperty("occurred_at_iso")
    private String occurredAtIso;
    @JsonProperty("failure_reason")
    private String failureReason;
    @JsonProperty("retry_count")
    private Integer retryCount;
    @JsonProperty("failure_started_at")
    private String failureStartedAt;
    @JsonProperty("failure_started_at_iso")
    private String failureStartedAtIso;
    @JsonProperty("recovered_at")
    private String recoveredAt;
    @JsonProperty("recovered_at_iso")
    private String recoveredAtIso;
    @JsonProperty("duration_sec")
    private Integer durationSec;
    @JsonProperty("router_wan_ip")
    private String routerWanIp;
    @JsonProperty("public_ip")
    private String publicIp;
    @JsonProperty("outbound_ok")
    private Boolean outboundOk;
    private String rawJson;
    private String createdAt;
}
