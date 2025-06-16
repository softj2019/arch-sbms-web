package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.HidLogDTO;
import com.archivsoft.sbms.mapper.HidLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HidLogService {
    private final HidLogMapper hidLogMapper;

    @Autowired
    public HidLogService(HidLogMapper hidLogMapper) {
        this.hidLogMapper = hidLogMapper;
    }

    public void insertHidLog(String terminalId, int peopleCount, int statPeopleCount, String fileName) {
        HidLogDTO hidLogDTO = HidLogDTO.builder()
                .terminalId(terminalId)
                .peopleCount(peopleCount)
                .statPeopleCount(statPeopleCount)
                .fileName(fileName)
                .timestamp(HidLogDTO.formatTimestamp(LocalDateTime.now())) // ✅ LocalDateTime → String 변환
                .build();

        hidLogMapper.insertHidLog(hidLogDTO);
    }

    public Page<HidLogDTO> getAllLogs(HidLogDTO hidLogDTO, PageRequest pageable) {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("s_terminalId" ,hidLogDTO.getTerminalId());
        paramMap.put("s_terminalNm" ,hidLogDTO.getTerminalNm());
        paramMap.put("pageSize"     ,pageable.getPageSize());
        paramMap.put("offset"       ,(int) pageable.getOffset());

        List<HidLogDTO> hidLogDTOList = hidLogMapper.getAllHidLogs(paramMap);
        int totalCount = hidLogMapper.getLogCount(paramMap);

        return new PageImpl<>(hidLogDTOList, pageable, totalCount);
    }
    public List<HidLogDTO> getMonthlyStats(int year) {
        return hidLogMapper.getMonthlyStats(year);
    }
}
