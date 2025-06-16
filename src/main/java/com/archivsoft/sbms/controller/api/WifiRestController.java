package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.WifiDTO;
import com.archivsoft.sbms.service.WifiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wifi")
public class WifiRestController {
    private final WifiService wifiService;

    public WifiRestController(WifiService wifiService) {
        this.wifiService = wifiService;
    }

    /**
     * WIFI 조회
     * */
    @GetMapping("/list")
    public ResponseEntity<List<WifiDTO>> getWifi() {
        List<WifiDTO> wifiDTOList = wifiService.getWifi();
        return ResponseEntity.ok(wifiDTOList);
    }
}
