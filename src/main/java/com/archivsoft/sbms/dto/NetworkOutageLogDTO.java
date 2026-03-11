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
public class NetworkOutageLogDTO {
    private Long id;
    private String terminalId;
    private String logHash;
    @JsonProperty("occurred_at")
    private String occurredAt;
    @JsonProperty("occurred_at_iso")
    private String occurredAtIso;
    private String level;
    private String logger;
    private String message;
    private String rawJson;
    private String createdAt;
}
