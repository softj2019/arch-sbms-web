package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.DeviceMaintenanceLogDTO;
import com.archivsoft.sbms.mapper.DeviceMaintenanceLogMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DeviceMaintenanceLogService {

    private final DeviceMaintenanceLogMapper mapper;

    public DeviceMaintenanceLogService(DeviceMaintenanceLogMapper mapper) {
        this.mapper = mapper;
    }

    public DeviceMaintenanceLogDTO createLog(String terminalId, String actionType, String command, String executedBy) {
        DeviceMaintenanceLogDTO logDTO = DeviceMaintenanceLogDTO.builder()
                .terminalId(terminalId)
                .actionType(actionType)
                .command(command)
                .executedBy(executedBy)
                .status("PENDING")
                .build();
        mapper.insertLog(logDTO);
        return logDTO;
    }

    public DeviceMaintenanceLogDTO createLogWithResult(String terminalId, String actionType,
                                                         String command, String commandResult,
                                                         String executedBy, String status) {
        DeviceMaintenanceLogDTO logDTO = DeviceMaintenanceLogDTO.builder()
                .terminalId(terminalId)
                .actionType(actionType)
                .command(command)
                .commandResult(commandResult)
                .executedBy(executedBy)
                .status(status)
                .build();
        mapper.insertLogWithResult(logDTO);
        return logDTO;
    }

    public void updateResult(Long logId, String commandResult, String status) {
        mapper.updateLogResult(logId, commandResult, status);
    }

    public List<DeviceMaintenanceLogDTO> getLogs(String terminalId, String actionType,
                                                  String startDate, String endDate,
                                                  int page, int size) {
        Map<String, Object> params = buildParams(terminalId, actionType, startDate, endDate, page, size);
        return mapper.getLogs(params);
    }

    public int getLogCount(String terminalId, String actionType, String startDate, String endDate) {
        Map<String, Object> params = buildParams(terminalId, actionType, startDate, endDate, 0, 0);
        return mapper.getLogCount(params);
    }

    private Map<String, Object> buildParams(String terminalId, String actionType,
                                             String startDate, String endDate,
                                             int page, int size) {
        Map<String, Object> params = new HashMap<>();
        params.put("terminalId", terminalId);
        params.put("actionType", actionType);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        params.put("pageSize", size);
        params.put("offset", page * size);
        return params;
    }
}
