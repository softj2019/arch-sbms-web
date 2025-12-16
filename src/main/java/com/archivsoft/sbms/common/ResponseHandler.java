package com.archivsoft.sbms.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ResponseHandler {
    /**
    * 응답 핸들러
    * @param isSuccess  : 작업 성공 여부 (true/false)
    * @param successMsg : 성공 메세지 (default : "작업 성공"
    * @param failMsg    : 실패 메세지 (default : "작업 실패"
    * @param response   : 반환대상 Map
    * @return           : ResponseEntity(response) 객체 반환
    * */
    public ResponseEntity<Map<String, Object>> generateResponse
            (boolean isSuccess,
            String successMsg,
            String failMsg,
            Map<String, Object> response)
    {
        successMsg = successMsg == null
                                ? "작업 성공"
                                : successMsg;
        failMsg    = failMsg    == null
                                ? "작업 실패"
                                : failMsg;

        if (isSuccess) {
            response.put("status", "success");
            response.put("message", successMsg);
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "fail");
            response.put("message", failMsg);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * exception 핸들러
     * @param e        : exception
     * @param response : 반환대상 Map
     * @param errorMsg : 에러 메세지 (default : 작업중 에러발생"
     * @return         : ResponseEntity(response) 객체 반환
     * */
    public ResponseEntity<Map<String, Object>> exceptionHandler
            (Exception e,
             String errorMsg,
             Map<String, Object> response)
    {
        response.put("status", "error");
        response.put("message", "사용자 수정 에러: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // exception 에러 메세지를 수정 이외 공통으로 적용하기 위한 핸들러, 서버측 에러 메세지를 뷰에서 그대로 출력용
    public ResponseEntity<Map<String, Object>> commonExceptionHandler
            (Exception e,
             String errorMsg,
             Map<String, Object> response)
    {
        response.put("status", "error");
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
