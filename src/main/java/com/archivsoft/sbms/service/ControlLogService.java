package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.ControlLogDTO;
import com.archivsoft.sbms.mapper.ControlLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ControlLogService {
    private final ControlLogMapper controlLogMapper;
    
    /**
     * 통합 제어 이력 조회
     * */
    public Page<ControlLogDTO> getLogList (ControlLogDTO controlLogDTO, PageRequest pageable){
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("s_terminalId" ,controlLogDTO.getTerminalId());
        paramMap.put("s_deviceName" ,controlLogDTO.getDeviceName());
        paramMap.put("s_userId"     ,controlLogDTO.getUserId());
        paramMap.put("pageSize"     ,pageable.getPageSize());
        paramMap.put("offset"       ,(int) pageable.getOffset());

        List<ControlLogDTO> logs = controlLogMapper.getLogList(paramMap);
        int totalCount = controlLogMapper.getLogCount(paramMap);

        return new PageImpl<>(logs, pageable, totalCount);
    }
}
