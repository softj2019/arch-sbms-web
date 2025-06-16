package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.entity.Rmmenu;
import com.archivsoft.sbms.service.CommonService;
import com.archivsoft.sbms.service.GrantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/grant")
public class GrantRestController {
    private final GrantService grantService;
    private final CommonService commonService;

    /**
     * 권한관리 조회
     * */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getList() {
        Map<String, Object> userDetails = commonService.extractUserDetails();

        String userId   = userDetails.getOrDefault("userId", "UNKNOWN_USER").toString();
        String userRole = userDetails.getOrDefault("userRole", "UNKNOWN_ROLE").toString();

        // 권한 및 사용여부 무시하고 모든 메뉴 조회
        List<Rmmenu> menuSeq = grantService.list();
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("userId"   , userId    );
        responseData.put("userRole" , userRole  );
        responseData.put("menuSeq"  , menuSeq   );

        return ResponseEntity.ok(responseData);
    }
    
    /**
     * 메뉴 사용여부 및 권한 수정
     * */
    @ResponseBody
    @PutMapping("/update")
    public int update(@RequestBody List<Map<String, Object>> rows) {
        int result = 0;
        result = grantService.update(rows);
        return result;
    }
}
