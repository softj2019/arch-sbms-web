package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.UserHistoryDTO;
import com.archivsoft.sbms.service.SystemUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system/user")
public class UserHistoryRestController {

    private final SystemUserService systemUserService;
    public UserHistoryRestController(SystemUserService systemUserService) {
        this.systemUserService = systemUserService;
    }

    @GetMapping("/login-history")
    public Page<UserHistoryDTO> getUserLoginHistory(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String userNm,
            @RequestParam(required = false) String clientIp,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    )
    {
        // DTO로 검색 필터 구성
        UserHistoryDTO filter = new UserHistoryDTO();
        filter.setUserId(userId);
        System.out.println("userNm param: " + userNm);
        filter.setUserNm(userNm);
        filter.setClientIp(clientIp);

        PageRequest pageable = PageRequest.of(page, size);

        return systemUserService.getUserLoginHistory(filter, pageable);
    }
}
