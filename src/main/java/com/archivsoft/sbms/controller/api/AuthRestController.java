package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.config.JwtBlacklistService;
import com.archivsoft.sbms.dto.UserHistoryDTO;
import com.archivsoft.sbms.entity.SystemUserEntity;
import com.archivsoft.sbms.mapper.UserMapper;
import com.archivsoft.sbms.util.JwtTokenUtil;
import egovframework.com.cmm.EgovMessageSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
@RestController
@Slf4j
@RequestMapping("/api/auth")
public class AuthRestController {
    @Autowired
    private JwtBlacklistService jwtBlacklistService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private EgovMessageSource messageSource;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    @Autowired
    private UserMapper userMapper;

    //    private Map<String, String> userDatabase = new HashMap<>(); // 테스트용 메모리 데이터베이스
    // 사용자 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@RequestParam String username, @RequestParam String password, HttpServletResponse response, HttpServletRequest request) {
        Map<String, String> responseBody = new HashMap<>();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            SystemUserEntity user = (SystemUserEntity) authentication.getPrincipal();
            SecurityContextHolder.getContext().setAuthentication(authentication); // 로그인 성공시 SecurityContext 설정

            // IP 주소 받기
            String clientIp = getClientIp(request);

            // 로그인 이력 저장
            UserHistoryDTO history = new UserHistoryDTO();
            history.setUserId(user.getUserId());
            history.setUserNm(user.getUserNm());
            history.setClientIp(clientIp);
            history.setAction("로그인");
            userMapper.insertLoginHistory(history);

            // JMT 토큰 처리
            String role = "ROLE_" + user.getRole().getRoleName();

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", role);

            String token = jwtTokenUtil.generateToken(user.getUserId(), 3600, claims);

//            String token = jwtTokenUtil.generateToken(user.getUserId(), 3600, Collections.singletonMap("role", "USER"));
            Cookie cookie = new Cookie("JWT_TOKEN", token);
            cookie.setHttpOnly(true); //js 에서 접근가능 (배포시 주석해제)
            cookie.setSecure(false); //https 에서만 처리 (배포시 주석해제)
//            cookie.setHttpOnly(false);
//            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60);
            response.addCookie(cookie);

            responseBody.put("status", "success");
            return ResponseEntity.ok(responseBody);

        } catch (BadCredentialsException ex) {
            log.error("[Error] 로그인 실패: 잘못된 계정 정보");
            responseBody.put("status", "error");
            responseBody.put("message", "로그인 실패: 잘못된 계정 정보");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseBody);

        } catch (Exception e) {
            log.error("[Error] 로그인 중 오류 발생: {}", e.getMessage());
            responseBody.put("status", "error");
            responseBody.put("message", "로그인 중 오류 발생");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
        }
    }

    // 사용자 IP 가져오기
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }

        String[] headers = {
                "Proxy-Client-IP", "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headers) {
            ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip;
            }
        }

        return request.getRemoteAddr();
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logoutUser(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();

        String token = getJwtFromCookies(request);
        if (token != null) {
            Date expirationTime = jwtTokenUtil.getExpirationTime(token);
            long expirationMillis = expirationTime.getTime() - System.currentTimeMillis();
            jwtBlacklistService.blacklistToken(token, expirationMillis); // 블랙리스트에 추가
        }

        // JWT 쿠키 삭제
        Cookie cookie = new Cookie("JWT_TOKEN", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        response.setHeader("Set-Cookie", "JWT_TOKEN=; Path=/; HttpOnly; Secure; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT");

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("status", "success");

        return ResponseEntity.ok(responseBody);
    }

    // 쿠키에서 JWT 가져오는 메서드 추가
    private String getJwtFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("JWT_TOKEN".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // 현재 인증된 사용자 정보 조회
    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {

        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (userId == null || userId.isEmpty()) {
            String errorMessage = messageSource.getMessage("error.user.not.found");
            return ResponseEntity.status(401).body(Collections.singletonMap("error", errorMessage));
        }

        return ResponseEntity.ok(Collections.singletonMap("status", "success"));
    }
}
