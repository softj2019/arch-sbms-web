package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.HidLogDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Map;


import java.util.List;

@Mapper
public interface HidLogMapper {
    void insertHidLog(HidLogDTO hidLog);

    // hid 로그 조회
    List<HidLogDTO> getAllHidLogs(Map<String, Object> paramMap);

    // hid 조회 개수
    int getLogCount(Map<String, Object> paramMap);
    List<HidLogDTO> getMonthlyStats(@Param("year") int year);
}
