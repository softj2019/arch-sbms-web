package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.DeviceMaintenanceLogDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface DeviceMaintenanceLogMapper {

    void insertLog(DeviceMaintenanceLogDTO log);

    void updateLogResult(@Param("id") Long id,
                         @Param("commandResult") String commandResult,
                         @Param("status") String status);

    List<DeviceMaintenanceLogDTO> getLogs(Map<String, Object> params);

    int getLogCount(Map<String, Object> params);
}
