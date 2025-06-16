package com.archivsoft.sbms.service;

import com.archivsoft.sbms.entity.Rmmenu;
import com.archivsoft.sbms.mapper.GrantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GrantService {
    private final GrantMapper grantMapper;
    /**
     * 권한관리 페이지 메뉴 조회
     * */
    @Transactional
    public List<Rmmenu> list() {
        try {
            // 상위 메뉴 조회
            List<Rmmenu> rmmenus = grantMapper.menuList("");

            // 하위 메뉴 그룹핑
            for (Rmmenu rmmenu : rmmenus) {
                rmmenu.setSubMenus(grantMapper.menuList(rmmenu.getId().getMenuId()));
            }

            return rmmenus;
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * 권한관리 수정
     * */
    public int update(List<Map<String, Object>> rows) {
        int result = 0;
        try {
            for (Map<String, Object> row : rows) {
                result += grantMapper.update(row);
            }
        } catch (Exception e) {
            return 0;
        }
        return result;
    }
}
