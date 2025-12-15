package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.common.ResponseHandler;
import com.archivsoft.sbms.dto.ControlAllowedIpDTO;
import com.archivsoft.sbms.service.ControlAllowedIpService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/control/allowedIp")
public class ControlAllowedIpRestController {
    private final ResponseHandler responseHandler;
    private final ControlAllowedIpService controlAllowedIpService;
    public ControlAllowedIpRestController(ResponseHandler responseHandler, ControlAllowedIpService controlAllowedIpService) {
        this.responseHandler = responseHandler;
        this.controlAllowedIpService = controlAllowedIpService;
    }

    @GetMapping("/list")
    public ResponseEntity<Page<ControlAllowedIpDTO>> list(Pageable pageable) {
        Page<ControlAllowedIpDTO> controlAllowedIps = controlAllowedIpService.getControlAllowedIpList((PageRequest) pageable);
        return ResponseEntity.ok(controlAllowedIps);
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> create(@RequestBody ControlAllowedIpDTO controlAllowedIpDTO) {
        Map<String, Object> response = new HashMap<>();
        controlAllowedIpService.createControlAllowedIp(controlAllowedIpDTO);
        return responseHandler.generateResponse(true, null, null, response);
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> update(@RequestBody ControlAllowedIpDTO controlAllowedIpDTO) {
        Map<String, Object> response = new HashMap<>();
        controlAllowedIpService.updateControlAllowedIp(controlAllowedIpDTO);
        return responseHandler.generateResponse(true, null, null, response);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> delete(@RequestBody ControlAllowedIpDTO controlAllowedIpDTO) {
        Map<String, Object> response = new HashMap<>();
        controlAllowedIpService.deleteControlAllowedIp(controlAllowedIpDTO);
        return responseHandler.generateResponse(true, null, null, response);
    }

    @PostMapping("/isDuplicatedId")
    public ResponseEntity<Boolean> isDuplicatedId(@RequestBody ControlAllowedIpDTO controlAllowedIpDTO) {
        boolean isDuplicate = controlAllowedIpService.isDuplicatedIp(controlAllowedIpDTO);
        return ResponseEntity.ok(isDuplicate);
    }
}
