package com.archivsoft.sbms.dto;
import com.archivsoft.sbms.entity.Role;
import com.archivsoft.sbms.entity.SystemUserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String userId;         // 사용자 ID
    private String userNm;         // 사용자 이름
    private String userEmail;      // 사용자 이메일
    private String userTelno;      // 사용자 전화번호
    private String userPassword;   // 사용자 비밀번호
    private String userRole;       // 사용자 역할
    private String useYn;          // 사용 여부
    private String startDate;      // 검색 시작일
    private String endDate;        // 검색 종료일
    private String createdAt;      // 생성일자
    private String roleName;       // 권한명

    private List<String> userIdList; // 체크된 사용자 ID

    public LocalDateTime getParsedStartDate() {
        return startDate != null && !startDate.isEmpty() ? parseDate(startDate) : null;
    }

    public LocalDateTime getParsedEndDate() {
        return endDate != null && !endDate.isEmpty() ? parseDate(endDate).plusDays(1) : null;
    }

    private LocalDateTime parseDate(String date) {
        if (date == null || date.isEmpty()) return null;
        return LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
    }

    public static UserDTO fromEntity(SystemUserEntity user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .userNm(user.getUserNm())
                .userEmail(user.getUserEmail())
                .userTelno(user.getUserTelno())
                .userRole(user.getRole().getRoleName())
                .useYn(user.getUseYn())
                .createdAt(user.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .build();
    }

    public SystemUserEntity toEntity(Role role) {
        return SystemUserEntity.builder()
                .userId(userId)
                .userNm(userNm)
                .userEmail(userEmail)
                .userTelno(userTelno)
                .useYn(useYn)
                .role(role)
                .build();
    }
}
