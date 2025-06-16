package com.archivsoft.sbms.config;
import com.archivsoft.sbms.service.ArchUserDetailService;
import com.archivsoft.sbms.util.JwtTokenUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final ArchUserDetailService archUserDetailService;
    private final JwtBlacklistService jwtBlacklistService;

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, ArchUserDetailService archUserDetailService, JwtBlacklistService jwtBlacklistService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.archUserDetailService = archUserDetailService;
        this.jwtBlacklistService = jwtBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String token = getJwtFromCookies(request);
        if (token != null) {
            try {
                // 블랙리스트에 있는 토큰이면 차단
//                if (jwtBlacklistService.isTokenBlacklisted(token)) {
//                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                    response.getWriter().write("Token is blacklisted");
//                    return;
//                }

                String userId = jwtTokenUtil
                        .validateToken(token)
                        .get("user_id", String.class); // 토큰에서 user_id 추출

                // 객체화
                UserDetails userDetails = this.archUserDetailService.loadUserByUsername(userId);

                // 인증 객체 생성
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                // 유효하지 않은 토큰 처리
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }

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
}