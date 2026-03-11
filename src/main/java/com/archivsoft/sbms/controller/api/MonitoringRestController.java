package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.CommandDTO;
import com.archivsoft.sbms.dto.FacilityDTO;
import com.archivsoft.sbms.dto.HidLogDTO;
import com.archivsoft.sbms.dto.NetworkEventLogDTO;
import com.archivsoft.sbms.dto.NetworkOutageLogDTO;
import com.archivsoft.sbms.service.FacilityService;
import com.archivsoft.sbms.service.HidLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/monitoring")
public class MonitoringRestController {
    private final FacilityService facilityService;
    private final HidLogService hidLogService;

    /*
    * 정류장 데이터 조회
    * */
    @GetMapping("/list")
    public ResponseEntity<List<FacilityDTO>> getTerminalList(
            @RequestParam(required = false) String terminalId,
            @RequestParam(required = false) String terminalNm
    ){
        FacilityDTO facilityDTO = new FacilityDTO();
        facilityDTO.setTerminalId(terminalId);
        facilityDTO.setTerminalName(terminalNm);

        List<FacilityDTO> facilityDTOList = facilityService.getTerminalList(facilityDTO);

        return ResponseEntity.ok(facilityDTOList);
    }

    @PostMapping("/nmslogin")
    public ResponseEntity<Map<String, Object>> nmslogin(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String wanip) {
        String routerUrl;
        if ("192.168.10.254".equals(wanip)) {
            routerUrl = "http://" + wanip + "/status_wanlink.asp"; // 포트 제거
        } else {
            routerUrl = "http://" + wanip + ":8080/status_wanlink.asp"; // 기본 포트 포함
        }


        // Basic Auth 헤더 생성
        String authHeader = "Basic " + Base64
                                        .getEncoder()
                                        .encodeToString((username + ":" + password)
                                        .getBytes());

        // HTTP 요청 설정
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // 로그인 요청 실행
        ResponseEntity<String> response;
        Map<String, Object> result = new HashMap<>();

        try {
            response = restTemplate.exchange(routerUrl, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode() == HttpStatus.OK) {

                result.put("success", true);
                result.put("message", "로그인 성공");
                if ("192.168.10.254".equals(wanip)) {
                    result.put("redirectUrl", "http://" + wanip + "/"); // 대시보드 URL 추가
                } else {
                    result.put("redirectUrl", "http://" + wanip + ":8080/"); // 대시보드 URL 추가
                }

                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "로그인 실패: " + response.getStatusCode());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "서버 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    // hid 리스트 조회
    @GetMapping("/hidList")
    public ResponseEntity<Page<HidLogDTO>> getAllLogs(
            @RequestParam(required = false) String terminalId,
            @RequestParam(required = false) String terminalNm,
            Pageable pageable
    ){
        HidLogDTO hidLogDTO = new HidLogDTO();
        hidLogDTO.setTerminalId(terminalId);
        hidLogDTO.setTerminalNm(terminalNm);

        Page<HidLogDTO> hidLogDTOList = hidLogService.getAllLogs(hidLogDTO, (PageRequest) pageable);

        return ResponseEntity.ok(hidLogDTOList);
    }

    @GetMapping("/network/{terminalId}/events")
    public ResponseEntity<List<NetworkEventLogDTO>> getRecentNetworkEvents(@PathVariable String terminalId) {
        return ResponseEntity.ok(facilityService.getRecentNetworkEvents(terminalId));
    }

    @GetMapping("/network/{terminalId}/outage-logs")
    public ResponseEntity<List<NetworkOutageLogDTO>> getRecentNetworkOutageLogs(@PathVariable String terminalId) {
        return ResponseEntity.ok(facilityService.getRecentNetworkOutageLogs(terminalId));
    }
}
