package com.archivsoft.sbms.util;
import com.archivsoft.sbms.exception.CustomJwtException;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenUtil {
    @Value("${app.jwt.secret_key}")
    private String jwtSecretKey;

    public String generateToken(String subject, long expirationInSeconds, Map<String, Object> claims) {
        Map<String, Object> mutableClaims = claims != null
                                                    ? new HashMap<>(claims)
                                                    : new HashMap<>();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationInSeconds * 1000);
        String base64EncodedKey = Base64.getEncoder().encodeToString(jwtSecretKey.getBytes());
        // 추가 클레임 설정
        mutableClaims.put("user_id", subject);
        mutableClaims.put("role", claims.get("role"));

        return Jwts.builder()
                .setClaims(mutableClaims) // 추가 클레임 설정
                .setSubject(subject)         // 주제 (subject) 설정
                .setIssuedAt(now)            // 발행 시간
                .setExpiration(expiryDate)   // 만료 시간
                .signWith(SignatureAlgorithm.HS256, base64EncodedKey) // 서명
                .compact();
    }
    // 토큰 검증 메서드
    public Claims validateToken(String token) {
        try {
            String base64EncodedKey = Base64.getEncoder().encodeToString(jwtSecretKey.getBytes());
            return Jwts.parser()
                    .setSigningKey(base64EncodedKey)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new CustomJwtException("Token has expired", e, HttpStatus.UNAUTHORIZED);
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException e) {
            throw new CustomJwtException("Invalid token signature", e, HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException e) {
            throw new CustomJwtException("Invalid JWT token", e, HttpStatus.BAD_REQUEST);
        }
    }

    // 토큰 만료시간 가져오는 메서드
    public Date getExpirationTime(String token) {
        return validateToken(token).getExpiration();
    }
}
