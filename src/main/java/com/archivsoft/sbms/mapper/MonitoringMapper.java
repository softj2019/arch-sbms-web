package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.MonitoringDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MonitoringMapper {
    // 모니터링 값 저장
    void saveData(MonitoringDTO monitoringDTO);

    // 테이블 초기화
    void truncateTable();
}

