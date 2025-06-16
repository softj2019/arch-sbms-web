package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.ControlDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ControlMapper {

    // 통합제어 로그 삽입
    void addLog(ControlDTO controlDTO);
}

