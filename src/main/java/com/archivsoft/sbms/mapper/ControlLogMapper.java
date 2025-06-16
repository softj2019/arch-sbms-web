package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.ControlLogDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ControlLogMapper {

    // 통합 제어 로그 조회
    List<ControlLogDTO> getLogList(Map<String, Object> paramMap);

    // 통합 제어 로그 카운트 조회
    int getLogCount(Map<String, Object> paramMap);
}

