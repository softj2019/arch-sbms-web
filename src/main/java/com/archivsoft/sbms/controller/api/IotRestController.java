package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.NetworkOutageLogDTO;
import com.archivsoft.sbms.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/iot")
public class IotRestController {
    private final FacilityService facilityService;

    @GetMapping("/network-outage-logs")
    public ResponseEntity<List<NetworkOutageLogDTO>> getNetworkOutageLogs(
            @RequestParam("terminal_id") String terminalId
    ) {
        return ResponseEntity.ok(facilityService.getRecentNetworkOutageLogs(terminalId));
    }
}
