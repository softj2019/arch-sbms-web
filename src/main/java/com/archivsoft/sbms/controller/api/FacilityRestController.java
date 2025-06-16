package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.common.ResponseHandler;
import com.archivsoft.sbms.dto.FacilityDTO;
import com.archivsoft.sbms.service.CommonService;
import com.archivsoft.sbms.service.ControlMessageService;
import com.archivsoft.sbms.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facility")
public class FacilityRestController {
    private final FacilityService facilityService;
    private final ResponseHandler responseHandler;
    private final ControlMessageService emService;
    private final CommonService commonService;

    @Autowired
    public FacilityRestController(FacilityService facilityService, ResponseHandler responseHandler, ControlMessageService emService, CommonService commonService) {
        this.facilityService = facilityService;
        this.responseHandler = responseHandler;
        this.emService = emService;
        this.commonService = commonService;
    }
    
    /**
     * 시설물 현황 조회
     * */
    @GetMapping("/list")
    public ResponseEntity<Page<FacilityDTO>> getFacilityList(
            @RequestParam(required = false) String terminalId,
            @RequestParam(required = false) String terminalNm,
            Pageable pageable
    ) {
        FacilityDTO facilityDTO = new FacilityDTO();
        facilityDTO.setTerminalId(terminalId);
        facilityDTO.setTerminalName(terminalNm);
        Page<FacilityDTO> facilities = facilityService.getFacilityList(facilityDTO, (PageRequest) pageable);

        return ResponseEntity.ok(facilities);
    }

    /**
     * 터미널 및 디바이스 등록
     * */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createFacility(@RequestBody FacilityDTO facilityDTO) {
        Map<String, Object> response = new HashMap<>();
        String terminalName = facilityDTO.getTerminalName();
        Boolean result      = false;

        Map<String, Object> userDetails = commonService.extractUserDetails();
        String userId   = userDetails.get("userId").toString();
        if (userId == null){
            userId = "";
        }

        // 처리대상 터미널 이름 저장
        response.put("terminalName" ,terminalName);

        try {
            result = facilityService.createFacility(facilityDTO); // 정류장 및 시설물 insert
            if (result){
                result = emService.createMessage(facilityDTO, userId); // 비상메시지테이블에 정류장 데이터 insert
            }
            return responseHandler.generateResponse(result, null,null, response);
        } catch (Exception e) {
            return responseHandler.exceptionHandler(e, null, response);
        }
    }

    /**
     * 터미널 및 디바이스 수정
     * */
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> update(@RequestBody FacilityDTO facilityDTO) {
        Map<String, Object> response = new HashMap<>();
        String terminalName = facilityDTO.getTerminalName();
        Boolean result      = false;

        // 처리대상 사용자명 저장
        response.put("terminalName" ,terminalName);

        try{
            result = facilityService.updateFacility(facilityDTO);
            return responseHandler.generateResponse(result, null,null, response);
        } catch (Exception e) {
            return responseHandler.exceptionHandler(e, null, response);
        }
    }
    
    /**
     * 시설물 삭제
     * */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> delete(@RequestBody FacilityDTO facilityDTO) {
        Map<String, Object> response = new HashMap<>();
        Boolean result               = false;

        response.put("terminalIdList" ,facilityDTO.getTerminalIdList());

        try{
            result = facilityService.deleteFacility(facilityDTO);
            return responseHandler.generateResponse(result, null, null, response);
        } catch (Exception e){
            return responseHandler.exceptionHandler(e, null, response);
        }
    }
    
    /**
     * 시설물 중복확인
     * */
    @PostMapping("/isDuplicatedId")
    public ResponseEntity<Boolean> isDuplicateId(@RequestBody FacilityDTO facilityDTO) {
        boolean isDuplicate = facilityService.isDuplicateId(facilityDTO);

        return ResponseEntity.ok(isDuplicate);
    }

    /**
     * 시설물 리스트 단순 조회
     * */
    @GetMapping("/listSimple")
    public ResponseEntity<List<FacilityDTO>> listSimple() {
        List<FacilityDTO> facilityDTOList = facilityService.getTerminalList(null);

        return ResponseEntity.ok(facilityDTOList);
    }
}
