package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.common.ResponseHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/control/allowedIp")
public class ControlAllowedIpRestController {

    private final ResponseHandler responseHandler;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createAllowedIp() {
        Map<String, Object> response = new HashMap<>();

        ResponseEntity<Map<String, Object>> responseEntity = responseHandler.generateResponse(true, null, null, response);

        return responseEntity;
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateAllowedIp() {
        Map<String, Object> response = new HashMap<>();

        ResponseEntity<Map<String, Object>> responseEntity = responseHandler.generateResponse(true, null, null, response);

        return responseEntity;
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteAllowedIp() {
        Map<String, Object> response = new HashMap<>();

        ResponseEntity<Map<String, Object>> responseEntity = responseHandler.generateResponse(true, null, null, response);

        return responseEntity;
    }


    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getAllowedIpList() {
        Map<String, Object> response = new HashMap<>();

        ResponseEntity<Map<String, Object>> responseEntity = responseHandler.generateResponse(true, null, null, response);

        return responseEntity;
    }

}
