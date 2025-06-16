package com.archivsoft.sbms.config;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JwtBlacklistService {
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    // JWT를 블랙리스트에 추가 (만료 시간 저장)
    public void blacklistToken(String token, long expirationMillis) {
        blacklist.put(token, System.currentTimeMillis() + expirationMillis);
    }

    // 블랙리스트에 있는지 확인
    public boolean isTokenBlacklisted(String token) {
        return blacklist.containsKey(token) && blacklist.get(token) > System.currentTimeMillis();
    }
}
