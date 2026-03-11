package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.MonitoringDTO;
import com.archivsoft.sbms.mapper.MonitoringMapper;
import com.archivsoft.sbms.mapper.TerminalNetworkMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MonitoringServiceTest {

    @Mock
    private MonitoringMapper monitoringMapper;

    @Mock
    private TerminalNetworkMapper terminalNetworkMapper;

    @Captor
    private ArgumentCaptor<MonitoringDTO> monitoringCaptor;

    private MonitoringService monitoringService;

    @BeforeEach
    void setUp() {
        monitoringService = new MonitoringService(monitoringMapper, terminalNetworkMapper, new ObjectMapper());
    }

    @Test
    void processMessage_acceptsLegacyPayload() {
        String payload = "{"
                + "\"terminal_id\":26019,"
                + "\"ipaddress\":\"10.0.0.2\","
                + "\"rfc_cpu\":\"23%\""
                + "}";

        assertDoesNotThrow(() -> monitoringService.processMessage(payload));

        verify(monitoringMapper).saveData(monitoringCaptor.capture());
        MonitoringDTO saved = monitoringCaptor.getValue();
        assertThat(saved.getTerminal_id()).isEqualTo(26019);
        assertThat(saved.getNetwork_event_logs_raw()).isNull();
        verify(terminalNetworkMapper).upsertNetworkStatus(any());
        verify(terminalNetworkMapper, times(0)).insertNetworkEvent(any());
    }

    @Test
    void processMessage_savesStructuredNetworkPayload() {
        String payload = "{"
                + "\"terminal_id\":26019,"
                + "\"network_retry_count\":3,"
                + "\"network_outage_started_at\":\"2026-03-11T10:00:00+09:00\","
                + "\"network_last_recovered_at\":\"2026-03-11T10:05:00+09:00\","
                + "\"network_last_reboot_requested_at\":\"2026-03-11T10:04:00+09:00\","
                + "\"network_pending_event_count\":1,"
                + "\"network_retry_interval_sec\":60,"
                + "\"network_reboot_threshold\":10,"
                + "\"network_failure_reason\":\"wan_down\","
                + "\"network_event_logs\":[{"
                + "\"occurred_at_iso\":\"2026-03-11T10:00:00+09:00\","
                + "\"failure_reason\":\"wan_down\","
                + "\"retry_count\":3,"
                + "\"failure_started_at_iso\":\"2026-03-11T10:00:00+09:00\","
                + "\"recovered_at_iso\":\"2026-03-11T10:05:00+09:00\","
                + "\"duration_sec\":300,"
                + "\"router_wan_ip\":\"1.1.1.1\","
                + "\"public_ip\":\"2.2.2.2\","
                + "\"outbound_ok\":false"
                + "}]"
                + "}";

        monitoringService.processMessage(payload);

        verify(monitoringMapper).saveData(monitoringCaptor.capture());
        assertThat(monitoringCaptor.getValue().getNetwork_event_logs_raw()).contains("occurred_at_iso");
        verify(terminalNetworkMapper).upsertNetworkStatus(any());
        verify(terminalNetworkMapper).insertNetworkEvent(any());
    }

    @Test
    void processMessage_parsesTextualNetworkEventLogsJson() {
        String payload = "{"
                + "\"terminal_id\":26019,"
                + "\"network_event_logs\":\"[{\\\"occurred_at_iso\\\":\\\"2026-03-11T10:00:00+09:00\\\",\\\"failure_reason\\\":\\\"wan_down\\\",\\\"retry_count\\\":2}]\""
                + "}";

        monitoringService.processMessage(payload);

        verify(monitoringMapper).saveData(monitoringCaptor.capture());
        assertThat(monitoringCaptor.getValue().getNetwork_event_logs_raw()).contains("occurred_at_iso");
        verify(terminalNetworkMapper).upsertNetworkStatus(any());
        verify(terminalNetworkMapper).insertNetworkEvent(any());
    }

    @Test
    void processMessage_ignoresInvalidNetworkEventLogsJson() {
        String payload = "{"
                + "\"terminal_id\":26019,"
                + "\"network_event_logs\":\"{not-json}\""
                + "}";

        assertDoesNotThrow(() -> monitoringService.processMessage(payload));

        verify(monitoringMapper).saveData(monitoringCaptor.capture());
        assertThat(monitoringCaptor.getValue().getNetwork_event_logs_raw()).isEqualTo("{not-json}");
        verify(terminalNetworkMapper).upsertNetworkStatus(any());
        verify(terminalNetworkMapper, times(0)).insertNetworkEvent(any());
    }
}
