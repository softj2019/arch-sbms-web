package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.common.ClientInfoUtil;
import com.archivsoft.sbms.common.ResponseHandler;
import com.archivsoft.sbms.dto.ControlDTO;
import com.archivsoft.sbms.service.CommonService;
import com.archivsoft.sbms.service.ControlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/control")
public class ControlRestController {
    private final ControlService controlService;
    private final CommonService commonService;
    private final ResponseHandler responseHandler;
    private final ClientInfoUtil clientInfoUtil;

    @PostMapping("/addLog")
    public ResponseEntity<Map<String, Object>> addLog (@RequestBody ControlDTO controlDTO, HttpServletRequest request){
        boolean result = false;
        String userId;

        Map<String, Object> userDetails = commonService.extractUserDetails();
        if (userDetails.get("userId") != null) {
            userId = userDetails.get("userId").toString();
        } else {
            userId = "TEMP";
        }

        String userAgent = request.getHeader("User-Agent");

        controlDTO.setUserId(userId);
        controlDTO.setOs(clientInfoUtil.getOs(userAgent));
        controlDTO.setBrowser(clientInfoUtil.getBrowser(userAgent));
        controlDTO.setIp(clientInfoUtil.getClientIp(request));

        result = controlService.addLog(controlDTO);

        return responseHandler.generateResponse(result, null,null, userDetails);
    }
}
