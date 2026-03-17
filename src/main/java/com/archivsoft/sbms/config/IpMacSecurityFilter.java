package com.archivsoft.sbms.config;

import com.archivsoft.sbms.entity.SystemUserEntity;
import com.archivsoft.sbms.service.ControlAllowedIpService;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;
/**
 * 클라이언트 가 공인아이피로 요청하기떼문에 임시 해제
 * */
@Component
public class IpMacSecurityFilter extends OncePerRequestFilter {
    private final ControlAllowedIpService allowedIpService;
    private final Environment environment;

    public IpMacSecurityFilter(ControlAllowedIpService allowedIpService, Environment environment) {
        this.allowedIpService = allowedIpService;
        this.environment = environment;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // 예외 경로 허용
        if (isPermitAll(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // ROLE_DEVELOPER(9번) 권한이면 통과
        int roleId = getRoleIdFromAuthentication();
        if (roleId == 9) {
            filterChain.doFilter(request, response);
            return;
        }

        // 허용 IP 테이블의 데이터로 허용된 IP인지 검사
        List<String> allowedIp = allowedIpService.getIpListByUseFlag(1);

        String clientIp = getClientIp(request);

        if (isDevLocalRequest(clientIp, request.getServerName())) {
            logger.info("LoginIP [DEV LOCAL BYPASS] 접속IP : " + clientIp + ", serverName : " + request.getServerName());
            filterChain.doFilter(request, response);
            return;
        }

//        if (!allowedIp.contains(clientIp)) {
//            authRestController.logoutUser(request, response);
//            response.sendRedirect("/login");
//            return;
//        }

        logger.info("LoginIP [IP 요청] 접속IP : " + clientIp);

        if (!allowedIp.contains(clientIp)) {
            logger.info("LoginIP [IP 차단] 접속IP : " + clientIp);
            response.sendRedirect("/denied?ip=" + clientIp);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isDevLocalRequest(String clientIp, String serverName) {
        if (!environment.acceptsProfiles(Profiles.of("dev"))) {
            return false;
        }

        return "127.0.0.1".equals(clientIp)
                || "::1".equals(clientIp)
                || "0:0:0:0:0:0:0:1".equals(clientIp)
                || "localhost".equalsIgnoreCase(serverName);
    }

    private int getRoleIdFromAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof SystemUserEntity) {
                SystemUserEntity user = (SystemUserEntity) principal;
                if (user.getRole() != null) {
                    return user.getRole().getRoleId();
                }
            }
        }
        return 0;
    }

    private boolean isPermitAll(String uri) {
        return  uri.startsWith("/weather") ||
                uri.startsWith("/js/") ||
                uri.startsWith("/css/") ||
                uri.startsWith("/webjars/") ||
                uri.startsWith("/images/") ||
                uri.startsWith("/lib/jquery/") ||
                uri.startsWith("/font/") ||
                uri.startsWith("/api/iot/") ||
                uri.startsWith("/api/air/recent") ||
                uri.startsWith("/api/upload/") ||
                uri.startsWith("/api/setting/") ||
                uri.startsWith("/api/air/status") ||
                uri.startsWith("/monitoring/hid") ||
                uri.startsWith("/monitoring/command") ||
                uri.endsWith("devtools.json") ||
                uri.contains("/uploads/") ||
                uri.equals("/favicon.ico") ||
                uri.startsWith("/websocket") ||
                uri.startsWith("/sockjs-websocket") ||
                uri.startsWith("/api/auth/login") ||
                uri.matches(".*\\.(css|js|png|jpg|jpeg|gif|woff2|ttf|map)$") ||
                uri.startsWith("/login") ||
                uri.startsWith("/denied");
    }

    // 사용자 IP 가져오기
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For"); // 공인 IP 부터 중개되어 온 IP들을 ,(쉼표)구분으로 한줄 반환
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            ip = ip.split(",")[0].trim(); // 공인 IP 반환
            return convertToIPv4IfNeeded(ip);
        }

        String[] headers = { // 중개 되어 올 경우 존재할 수 있는 헤더들
                "Proxy-Client-IP", "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headers) {
            ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return convertToIPv4IfNeeded(ip);
            }
        }

        return convertToIPv4IfNeeded(request.getRemoteAddr());
    }

    // IPv4 변환
    private String convertToIPv4IfNeeded(String ip) {
        try {
            InetAddress inetAddress = InetAddress.getByName(ip);

            if (inetAddress.getAddress().length == 4) {
                return inetAddress.getHostAddress(); // 이미 IPv4라면 그대로 반환
            }

            if (inetAddress.getAddress().length == 16) {
                if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
                    return "127.0.0.1";
                }
                if (ip.startsWith("::ffff:")) {
                    return ip.substring(7);
                }
            }
        } catch (UnknownHostException e) {
            // 유효하지 않은 IP일 경우 그대로 반환
        }
        return ip;
    }
}
