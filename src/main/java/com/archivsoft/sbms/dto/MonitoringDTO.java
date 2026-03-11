package com.archivsoft.sbms.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoringDTO {
    private Integer terminal_id;
    private String ipaddress;
    private String rfc_cpu;
    private String cpu_temperature;
    private String rfc_memory_total;
    private String rfc_memory_used;
    private String rfc_memory_available;
    private String rfc_storage_total;
    private String rfc_storage_used;
    private String rfc_storage_available;
    private String ctl_board_power;
    private String smartscreen_power;
    private String led_panel_power;
    private String led_light_power;
    private String lcd_display_power;
    private String lte_router_power;
    private String vc_power;
    private String fan;
    private Integer network_retry_count;
    private String network_outage_started_at;
    private String network_last_recovered_at;
    private String network_last_reboot_requested_at;
    private Integer network_pending_event_count;
    private Integer network_retry_interval_sec;
    private Integer network_reboot_threshold;
    private String network_failure_reason;
    private JsonNode network_event_logs;
    private String network_event_logs_raw;
}
