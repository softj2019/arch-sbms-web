package com.archivsoft.sbms.service;

import com.archivsoft.sbms.entity.SystemUserEntity;
import com.archivsoft.sbms.repository.RmmenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
@Slf4j
public class CommonService {
    @Autowired
    private RmmenuRepository rmmenuRepository;

    public Map<String, Object> extractUserDetails() {
        Map<String, Object> userDetails = new HashMap<>();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof SystemUserEntity) {
            SystemUserEntity user = (SystemUserEntity) authentication.getPrincipal();
            userDetails.put("userId"        , user.getUserId());
            userDetails.put("userNm"        , user.getUserNm());
            userDetails.put("userRole"      , user.getRole().getRoleId());
        }

        return userDetails;
    }
}
