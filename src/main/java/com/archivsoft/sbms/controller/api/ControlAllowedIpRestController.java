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

    // 허용 IP 조회
    @GetMapping("/list")
    public ResponseEntity<Page<ControlAllowedIpDTO>> list(
            @RequestParam(required = false) String sIpDescription,
            @RequestParam(required = false) String sAllowedIp,
            @RequestParam(required = false) String sCreateUserId,
            @RequestParam(required = false) String sUpdateUserId,
            Pageable pageable) {

        ControlAllowedIpDTO allowedIpDTO = new ControlAllowedIpDTO();
        allowedIpDTO.setDescription(sIpDescription);
        allowedIpDTO.setIp(sAllowedIp);
        allowedIpDTO.setCreateUserId(sCreateUserId);
        allowedIpDTO.setUpdateUserId(sUpdateUserId);

        Page<ControlAllowedIpDTO> controlAllowedIps = controlAllowedIpService.getControlAllowedIpList(allowedIpDTO, (PageRequest) pageable);
        return ResponseEntity.ok(controlAllowedIps);
    }

    // 허용 IP 등록
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> create(@RequestBody ControlAllowedIpDTO controlAllowedIpDTO) {
        Map<String, Object> response = new HashMap<>();
        try{
            controlAllowedIpService.createControlAllowedIp(controlAllowedIpDTO);
            return responseHandler.generateResponse(true, null, null, response);
        } catch (Exception e) {
            return responseHandler.commonExceptionHandler(e, null, response);
        }
    }

    // 허용 IP 수정
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> update(@RequestBody ControlAllowedIpDTO controlAllowedIpDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            controlAllowedIpService.updateControlAllowedIp(controlAllowedIpDTO);
            return responseHandler.generateResponse(true, null, null, response);
        } catch (Exception e) {
            return responseHandler.commonExceptionHandler(e, null, response);
        }
    }

    // 허용 IP 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> delete(@RequestBody ControlAllowedIpDTO controlAllowedIpDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            controlAllowedIpService.deleteControlAllowedIp(controlAllowedIpDTO);
            return responseHandler.generateResponse(true, null, null, response);
        } catch (Exception e) {
            return responseHandler.commonExceptionHandler(e, null, response);
        }
    }
}
