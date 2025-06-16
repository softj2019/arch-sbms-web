package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.common.ResponseHandler;
import com.archivsoft.sbms.dto.UserDTO;
import com.archivsoft.sbms.service.SystemUserService;
import egovframework.com.cmm.EgovMessageSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system/user")
public class SystemUserRestController {
    private final SystemUserService systemUserService;
    private final ResponseHandler responseHandler;
    @Autowired
    private EgovMessageSource messageSource;
    public SystemUserRestController(SystemUserService systemService, ResponseHandler responseHandler) {
        this.systemUserService = systemService;
        this.responseHandler = responseHandler;
    }

    /**
     * 사용자 조회
     * */
    @GetMapping("/list")
    public ResponseEntity<Page<UserDTO>> getUserList(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String userNm,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Pageable pageable
    ) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUserId(userId);
        userDTO.setUserNm(userNm);
        userDTO.setUserEmail(userEmail);
        userDTO.setStartDate(startDate);
        userDTO.setEndDate(endDate);

        Page<UserDTO> users = systemUserService.getUserList(userDTO, (PageRequest) pageable);

        return ResponseEntity.ok(users);
    }
    
    /**
     * 아이디 중복확인
     * */
    @PostMapping("/isDuplicatedId")
    public ResponseEntity<Boolean> isDuplicateId(@RequestBody UserDTO userDTO) {
        boolean isDuplicate = systemUserService.isDuplicateId(userDTO.getUserId());

        return ResponseEntity.ok(isDuplicate);
    }

    /**
     * 사용자 등록
     * */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody UserDTO userDTO) {
        Map<String, Object> response = new HashMap<>();
        String createdId             = userDTO.getUserId();
        Boolean result               = false;

        // 처리대상 사용자명 저장
        response.put("userId"   , createdId);

        try {
            result = systemUserService.createUser(userDTO); // 서비스 호출
            return responseHandler.generateResponse(result, null, null, response);
        } catch (Exception e) {
            return responseHandler.exceptionHandler(e, null, response);
        }
    }
    
    /**
     * 사용자 삭제
     * */
    @DeleteMapping("/deleteUser")
    public ResponseEntity<Map<String, Object>> deleteUser(@RequestBody UserDTO userDTO) {
        Map<String, Object> response = new HashMap<>();
        Boolean result               = false;

        // 처리대상 사용자명 저장
        response.put("userId", userDTO.getUserId());

        try{
            result = systemUserService.deleteUser(userDTO);
            return responseHandler.generateResponse(result, null, null, response);
        } catch (Exception e){
            return responseHandler.exceptionHandler(e, null, response);
        }
    }

    /**
     * 사용자 수정
     * */
    @PutMapping("/updateUser")
    public ResponseEntity<Map<String, Object>> updateUser(@RequestBody UserDTO userDTO) {
        Map<String, Object> response = new HashMap<>();
        Boolean result               = false;
        
        // 처리대상 사용자명 저장
        response.put("userId", userDTO.getUserId());

        try{
            result = systemUserService.updateUser(userDTO);
            return responseHandler.generateResponse(result, null, null, response);
        } catch (Exception e) {
            return responseHandler.exceptionHandler(e, null, response);
        }
    }
}
