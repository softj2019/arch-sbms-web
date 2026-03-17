package com.archivsoft.sbms.service;

import com.archivsoft.sbms.controller.api.AuthRestController;
import com.archivsoft.sbms.entity.Rmmenu;
import com.archivsoft.sbms.repository.RmmenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuService {
    private final RmmenuRepository rmmenuRepository;
    private final HttpServletRequest request;
    private final HttpServletResponse response;
    private final AuthRestController authRestController;

    public List<Rmmenu> list(Map<String, Object> userDetails) {
        try {
            String userRole = String.valueOf(userDetails.get("userRole"));
            List<Rmmenu> rmmenus = getMenuList(userRole); // 트랜잭션이 적용된 메서드 호출

            String currentUri = request.getRequestURI();
            if (currentUri.startsWith("/")) {
                currentUri = currentUri.substring(1);
            }
            String currentUriPattern = "%" + currentUri + "%";

            int userRoleId;
            try {
                userRoleId = Integer.parseInt(userRole);
            } catch (NumberFormatException e) {
                userRoleId = 0;
            }

            // rmmenulink 테이블에서 사용자의 권한에 맞는 url이 존재할 겨우
            boolean permissionCheck = rmmenuRepository.myPermissionUrlList(userRoleId, currentUriPattern) > 0;

            // 권한이없거나 특정 uri 제외 로그아웃처리
            if (!permissionCheck
                    && !currentUri.startsWith("api/")
                    && !currentUri.startsWith("/webjars/")
                    && !currentUri.startsWith("webjars/")
                    && !currentUri.equals("logout")
                    && !currentUri.equals("login")
                    && !currentUri.equals("weather")
                    && !currentUri.equals("error")
                    && !currentUri.equals("denied")
                    && !currentUri.startsWith("websocket")
                    && !currentUri.startsWith("sockjs-websocket")
                    && !currentUri.startsWith("monitoring/hid")
                    && !currentUri.startsWith("monitoring/command")
                    && !currentUri.startsWith("monitoring/device")
                    && !currentUri.endsWith(".css")
                    && !currentUri.endsWith(".js")
                    && !currentUri.endsWith(".woff2")
                    && !currentUri.endsWith(".ttf")
                    && !currentUri.endsWith(".map")
            ) {
                log.error("현재 권한 : {}", permissionCheck);
                log.error("현재 URI : {}", currentUri);

                handleUnauthorizedAccess();
                return null;
            }

            return rmmenus;
        } catch (Exception e) {
            log.error("메뉴 목록 조회 중 오류 발생", e);
            return null;
        }
    }

    @Transactional // 트랜잭션을 별도로 관리
    public List<Rmmenu> getMenuList(String userRole) {
        List<Rmmenu> rmmenus = rmmenuRepository.getUpperMenu("1", userRole); // 상위 메뉴  Select
        for (Rmmenu rmmenu : rmmenus) {
            rmmenu.setSubMenus(rmmenuRepository.findByUseFlagAndUpperMenuIdOrderByMenuSortSno("1", rmmenu.getId().getMenuId())); // 하위 메뉴 Select
        }
        return rmmenus;
    }

    // 로그아웃처리
    private void handleUnauthorizedAccess() {
        try {
            authRestController.logoutUser(request, response); // 트랜잭션 외부에서 실행
            response.sendRedirect("/login");
        } catch (Exception e) {
            log.error("로그아웃 중 오류 발생", e);
        }
    }
}

