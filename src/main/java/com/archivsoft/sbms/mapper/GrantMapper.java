package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.entity.Rmmenu;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Mapper
@Repository
public interface GrantMapper {
    // 권한 및 사용여부 무시하고 모든 메뉴 조회
    List<Rmmenu> menuList(String menuId);

    // 메뉴 권한 수정
    int update(Map<String, Object> rows);
}

