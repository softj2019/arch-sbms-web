package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.DeviceMaintenanceLogDTO;
import com.archivsoft.sbms.dto.FacilityDTO;
import com.archivsoft.sbms.service.DeviceMaintenanceLogService;
import com.archivsoft.sbms.service.FacilityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/device")
public class DeviceRestController {

    private final FacilityService facilityService;
    private final DeviceMaintenanceLogService maintenanceLogService;
    private final SimpMessagingTemplate messagingTemplate;

    public DeviceRestController(FacilityService facilityService,
                                DeviceMaintenanceLogService maintenanceLogService,
                                SimpMessagingTemplate messagingTemplate) {
        this.facilityService = facilityService;
        this.maintenanceLogService = maintenanceLogService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/list")
    public ResponseEntity<List<FacilityDTO>> getDeviceList(
            @RequestParam(required = false) String terminalId,
            @RequestParam(required = false) String terminalNm) {
        FacilityDTO facilityDTO = new FacilityDTO();
        facilityDTO.setTerminalId(terminalId);
        facilityDTO.setTerminalName(terminalNm);

        List<FacilityDTO> list = facilityService.getTerminalList(facilityDTO);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/command")
    public ResponseEntity<Map<String, Object>> sendCommand(@RequestBody Map<String, String> payload) {
        String terminalId = payload.get("terminalId");
        String actionType = payload.get("actionType");
        String command = payload.get("command");

        String executedBy = getExecutedBy();

        // 1) DB INSERT (status=PENDING)
        DeviceMaintenanceLogDTO logDTO = maintenanceLogService.createLog(terminalId, actionType, command, executedBy);

        // 2) STOMP 전송
        Map<String, String> stompMessage = new HashMap<>();
        stompMessage.put("command", command);
        stompMessage.put("terminalId", terminalId != null ? terminalId : "ALL");
        stompMessage.put("logId", String.valueOf(logDTO.getId()));
        messagingTemplate.convertAndSend("/topic/command", stompMessage);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("logId", logDTO.getId());
        response.put("message", "명령이 전송되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/maintenance-logs")
    public ResponseEntity<Map<String, Object>> getMaintenanceLogs(
            @RequestParam(required = false) String terminalId,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<DeviceMaintenanceLogDTO> logs = maintenanceLogService.getLogs(terminalId, actionType, startDate, endDate, page, size);
        int totalCount = maintenanceLogService.getLogCount(terminalId, actionType, startDate, endDate);

        Map<String, Object> result = new HashMap<>();
        result.put("data", logs);
        result.put("totalCount", totalCount);
        return ResponseEntity.ok(result);
    }

    private String getExecutedBy() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return auth.getName();
            }
        } catch (Exception e) {
            log.warn("사용자 정보 조회 실패", e);
        }
        return "unknown";
    }
}
