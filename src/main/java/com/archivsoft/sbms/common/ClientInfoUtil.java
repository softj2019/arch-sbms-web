package com.archivsoft.sbms.common;

import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

@Component
public class ClientInfoUtil {

  // IP
  public static String getClientIp(HttpServletRequest request) {
    String ip = request.getHeader("X-Forwarded-For");
    if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
      ip = ip.split(",")[0].trim();
      return convertToIPv4IfNeeded(ip);
    }

    String[] headers = {
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
  private static String convertToIPv4IfNeeded(String ip) {
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

  // OS
  public static String getOs(String userAgent) {
    if (userAgent == null) return "Unknown";
    String ua = userAgent.toLowerCase();

    if (ua.contains("windows")) return "Windows";
    if (ua.contains("mac")) return "Mac";
    if (ua.contains("linux")) return "Linux";
    if (ua.contains("android")) return "Android";
    if (ua.contains("iphone") || ua.contains("ipad")) return "iOS";

    return "Other";
  }

  // 브라우저
  public static String getBrowser(String userAgent) {
    if (userAgent == null) return "Unknown";
    String ua = userAgent.toLowerCase();

    // 순서 중요 (Chrome은 Safari 문자열도 포함하고, Edge는 Chrome 문자열도 포함함)
    if (ua.contains("edg")) return "Edge";          // 엣지
    if (ua.contains("chrome")) return "Chrome";     // 크롬
    if (ua.contains("trident") || ua.contains("msie")) return "IE"; // 익스플로러
    if (ua.contains("firefox")) return "Firefox";   // 파이어폭스
    if (ua.contains("safari")) return "Safari";     // 사파리
    if (ua.contains("opera") || ua.contains("opr")) return "Opera"; // 오페라

    return "Other";
  }
}
