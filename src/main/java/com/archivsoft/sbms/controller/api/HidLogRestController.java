package com.archivsoft.sbms.controller.api;
import com.archivsoft.sbms.dto.HidLogDTO;
import com.archivsoft.sbms.service.HidLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/occupancy")
public class HidLogRestController {
    private final HidLogService hidLogService;

    @Autowired
    public HidLogRestController(HidLogService hidLogService) {
        this.hidLogService = hidLogService;
    }

    @GetMapping("/stats")
    public ResponseEntity<List<HidLogDTO>> getOccupancyStats(@RequestParam int year) {
        List<HidLogDTO> stats = hidLogService.getMonthlyStats(year);
        return ResponseEntity.ok(stats);
    }
}
