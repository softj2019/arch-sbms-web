package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.FacilityDTO;
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
@RequestMapping("/api/controlScreen")
public class ControlScreenRestController {
    private final FacilityService facilityService;

    @GetMapping("/terminalList")
    public ResponseEntity<List<FacilityDTO>> getTerminalList(
            @RequestParam(required = false) String terminalId,
            @RequestParam(required = false) String terminalNm
    ) {
        FacilityDTO facilityDTO = new FacilityDTO();
        facilityDTO.setTerminalId(terminalId);
        facilityDTO.setTerminalName(terminalNm);

        List<FacilityDTO> facilityDTOList = facilityService.getTerminalList(facilityDTO);

        return ResponseEntity.ok(facilityDTOList);
    }
}
