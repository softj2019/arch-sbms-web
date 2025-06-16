package com.archivsoft.sbms.controller.api;


import com.archivsoft.sbms.common.ResponseHandler;
import com.archivsoft.sbms.dto.ControlMessageDTO;
import com.archivsoft.sbms.service.CommonService;
import com.archivsoft.sbms.service.ControlMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/controlMessage")
public class ControlMessageRestController {
    private final ControlMessageService messageService;
    private final ResponseHandler responseHandler;

    /**
     * 비상메시지 조회
     * */
    @GetMapping("msgList")
    public ResponseEntity<List<ControlMessageDTO>> getMsgList(){
        List<ControlMessageDTO> messageDTO = messageService.getMsgList();

        return ResponseEntity.ok(messageDTO);
    }
    
    /**
     * 비상메시지 수정
     * */
    @PutMapping("updateMsg")
    public ResponseEntity<Map<String, Object>> updateMsg(
            @RequestBody ControlMessageDTO messageDTO,
            @ModelAttribute("userDetails") Map<String, Object> userDetails
    ){
        Map<String, Object> response = new HashMap<>();
        String userId = userDetails.get("userId").toString();
        response.put("userId", userId);
        if (userId == null) {
            return responseHandler.generateResponse(false, null,null, response);
        } else {
            messageDTO.setEditorId(userId);
            messageService.updateMessage(messageDTO);

            return responseHandler.generateResponse(true, null,null, response);
        }
    }
}
