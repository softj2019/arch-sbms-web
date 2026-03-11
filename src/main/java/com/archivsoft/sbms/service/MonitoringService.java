package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.MonitoringDTO;
import com.archivsoft.sbms.dto.NetworkEventLogDTO;
import com.archivsoft.sbms.dto.TerminalNetworkStatusDTO;
import com.archivsoft.sbms.mapper.MonitoringMapper;
import com.archivsoft.sbms.mapper.TerminalNetworkMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class MonitoringService {
    private final MonitoringMapper monitoringMapper;
    private final TerminalNetworkMapper terminalNetworkMapper;
    private final ObjectMapper objectMapper;

    public MonitoringService(
            MonitoringMapper monitoringMapper,
            TerminalNetworkMapper terminalNetworkMapper,
            ObjectMapper objectMapper
    ) {
        this.monitoringMapper = monitoringMapper;
        this.terminalNetworkMapper = terminalNetworkMapper;
        this.objectMapper = objectMapper;
    }

    private MonitoringDTO convertJsonToDto(String message) {
        try {
            return objectMapper.readValue(message, MonitoringDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("JSON 변환 실패", e);
        }
    }

    public void processMessage(String message) {
        MonitoringDTO monitoringDTO = convertJsonToDto(message);
        monitoringDTO.setNetwork_event_logs_raw(extractRawNetworkEventLogs(monitoringDTO.getNetwork_event_logs()));
        saveData(monitoringDTO);
        saveNetworkDataSafely(monitoringDTO);
    }

    public void saveData(MonitoringDTO monitoringDTO) {
        try {
            monitoringMapper.saveData(monitoringDTO);
        } catch (Exception e) {
            throw new RuntimeException("데이터 저장 실패", e);
        }
    }

    private void saveNetworkDataSafely(MonitoringDTO monitoringDTO) {
        if (monitoringDTO.getTerminal_id() == null) {
            return;
        }

        try {
            terminalNetworkMapper.upsertNetworkStatus(toTerminalNetworkStatus(monitoringDTO));
        } catch (Exception e) {
            log.warn("네트워크 상태 저장 실패. terminalId={}", monitoringDTO.getTerminal_id(), e);
        }

        try {
            for (NetworkEventLogDTO eventLogDTO : parseNetworkEventLogs(monitoringDTO)) {
                terminalNetworkMapper.insertNetworkEvent(eventLogDTO);
            }
        } catch (Exception e) {
            log.warn("네트워크 이벤트 저장 실패. terminalId={}", monitoringDTO.getTerminal_id(), e);
        }
    }

    private TerminalNetworkStatusDTO toTerminalNetworkStatus(MonitoringDTO monitoringDTO) {
        return TerminalNetworkStatusDTO.builder()
                .terminalId(String.valueOf(monitoringDTO.getTerminal_id()))
                .networkRetryCount(monitoringDTO.getNetwork_retry_count())
                .networkOutageStartedAt(monitoringDTO.getNetwork_outage_started_at())
                .networkLastRecoveredAt(monitoringDTO.getNetwork_last_recovered_at())
                .networkLastRebootRequestedAt(monitoringDTO.getNetwork_last_reboot_requested_at())
                .networkPendingEventCount(monitoringDTO.getNetwork_pending_event_count())
                .networkRetryIntervalSec(monitoringDTO.getNetwork_retry_interval_sec())
                .networkRebootThreshold(monitoringDTO.getNetwork_reboot_threshold())
                .networkFailureReason(monitoringDTO.getNetwork_failure_reason())
                .networkEventLogsRaw(monitoringDTO.getNetwork_event_logs_raw())
                .build();
    }

    private String extractRawNetworkEventLogs(JsonNode networkEventLogsNode) {
        if (networkEventLogsNode == null || networkEventLogsNode.isNull()) {
            return null;
        }

        if (networkEventLogsNode.isTextual()) {
            return networkEventLogsNode.asText();
        }

        try {
            return objectMapper.writeValueAsString(networkEventLogsNode);
        } catch (JsonProcessingException e) {
            log.warn("network_event_logs raw 직렬화 실패", e);
            return null;
        }
    }

    private List<NetworkEventLogDTO> parseNetworkEventLogs(MonitoringDTO monitoringDTO) {
        JsonNode sourceNode = monitoringDTO.getNetwork_event_logs();
        if (sourceNode == null || sourceNode.isNull()) {
            return Collections.emptyList();
        }

        JsonNode parsedNode = sourceNode;
        if (sourceNode.isTextual()) {
            String rawValue = sourceNode.asText();
            if (rawValue == null || rawValue.trim().isEmpty()) {
                return Collections.emptyList();
            }

            try {
                parsedNode = objectMapper.readTree(rawValue);
            } catch (JsonProcessingException e) {
                log.warn("network_event_logs 파싱 실패. terminalId={}", monitoringDTO.getTerminal_id(), e);
                return Collections.emptyList();
            }
        }

        List<JsonNode> eventNodes = new ArrayList<>();
        if (parsedNode.isArray()) {
            parsedNode.forEach(eventNodes::add);
        } else if (parsedNode.isObject()) {
            eventNodes.add(parsedNode);
        } else {
            log.warn("network_event_logs 형식 이상. terminalId={}, nodeType={}",
                    monitoringDTO.getTerminal_id(), parsedNode.getNodeType());
            return Collections.emptyList();
        }

        List<NetworkEventLogDTO> eventLogDTOList = new ArrayList<>();
        String terminalId = String.valueOf(monitoringDTO.getTerminal_id());
        for (JsonNode eventNode : eventNodes) {
            try {
                NetworkEventLogDTO eventLogDTO = objectMapper.treeToValue(eventNode, NetworkEventLogDTO.class);
                eventLogDTO.setTerminalId(terminalId);
                eventLogDTO.setRawJson(objectMapper.writeValueAsString(eventNode));
                eventLogDTO.setEventHash(generateEventHash(terminalId, eventLogDTO));
                eventLogDTOList.add(eventLogDTO);
            } catch (JsonProcessingException | IllegalArgumentException e) {
                log.warn("network_event_logs 항목 파싱 실패. terminalId={}", monitoringDTO.getTerminal_id(), e);
            }
        }

        return eventLogDTOList;
    }

    private String generateEventHash(String terminalId, NetworkEventLogDTO eventLogDTO) {
        String source = String.join("|",
                safeValue(terminalId),
                safeValue(eventLogDTO.getOccurredAtIso()),
                safeValue(eventLogDTO.getFailureReason()),
                safeValue(eventLogDTO.getRetryCount()),
                safeValue(eventLogDTO.getFailureStartedAtIso()),
                safeValue(eventLogDTO.getRecoveredAtIso()),
                safeValue(eventLogDTO.getDurationSec()),
                safeValue(eventLogDTO.getRouterWanIp()),
                safeValue(eventLogDTO.getPublicIp()),
                safeValue(eventLogDTO.getOutboundOk())
        );

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(source.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte hashByte : hashBytes) {
                builder.append(String.format("%02x", hashByte & 0xff));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 해시 생성 실패", e);
        }
    }

    private String safeValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    @Transactional
    @Scheduled(cron = "0 0 0 */3 * ?")
    public void truncateTable() {
        monitoringMapper.truncateTable();
        log.info("TB_MONITORING 테이블 초기화 완료");
    }
}
