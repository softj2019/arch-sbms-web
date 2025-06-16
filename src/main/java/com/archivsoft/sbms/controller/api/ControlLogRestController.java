package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.ControlLogDTO;
import com.archivsoft.sbms.service.ControlLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/controlLog")
public class ControlLogRestController {
    private final ControlLogService controlLogService;

    /**
     * 제어 이력 조회
     * */
    @GetMapping("/getLogList")
    public ResponseEntity<Page<ControlLogDTO>> getLogList(
            @RequestParam(required = false) String terminalId,
            @RequestParam(required = false) String deviceName,
            @RequestParam(required = false) String userId,
            Pageable pageable
    ) {
        ControlLogDTO controlLogDTO = new ControlLogDTO();
        controlLogDTO.setTerminalId(terminalId);
        controlLogDTO.setDeviceName(deviceName);
        controlLogDTO.setUserId(userId);
        Page<ControlLogDTO>  logs = controlLogService.getLogList(controlLogDTO, (PageRequest) pageable);

        return ResponseEntity.ok(logs);
    }
}
