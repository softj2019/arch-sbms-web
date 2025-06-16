package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.FacilityDTO;
import com.archivsoft.sbms.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardRestController {
    private final FacilityService facilityService;

    @Autowired
    public DashboardRestController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }
    
    /**
     * 시설물 현황 조회
     * */
    @GetMapping("/terminalList")
    public ResponseEntity<List<FacilityDTO>> getTerminalList() {
        List<FacilityDTO> facilityDTO = facilityService.getTerminalList(null);

        return ResponseEntity.ok(facilityDTO);
    }

    /**
     * 시설물별 보유개수 조회
     * */
    @GetMapping("/devicesCnt")
    public ResponseEntity<Map<String, Integer>> getDevicesCnt() {
        Map<String, Integer> deviceMap = facilityService.getDevicesCnt();

        return ResponseEntity.ok(deviceMap);
    }
}
