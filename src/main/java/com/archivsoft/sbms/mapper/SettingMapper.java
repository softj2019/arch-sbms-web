package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.SettingDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface SettingMapper {
    // 기본 설정값 조회
    List<SettingDTO> getSetting();

    // 설정값 변경
    void updateSetting(@Param("setting") SettingDTO setting);

    // 접근가능 IP 조회
    String getIp();
}
