package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.FacilityDTO;
import com.archivsoft.sbms.dto.NetworkEventLogDTO;
import com.archivsoft.sbms.dto.TerminalNetworkStatusDTO;
import com.archivsoft.sbms.mapper.FacilityMapper;
import com.archivsoft.sbms.mapper.TerminalNetworkMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FacilityService {
    private final FacilityMapper facilityMapper;
    private final TerminalNetworkMapper terminalNetworkMapper;

    public FacilityService(FacilityMapper facilityMapper, TerminalNetworkMapper terminalNetworkMapper) {
        this.facilityMapper = facilityMapper;
        this.terminalNetworkMapper = terminalNetworkMapper;
    }

    public Page<FacilityDTO> getFacilityList(FacilityDTO facilityDTO, PageRequest pageable) {
        Map<String, Object> paramMap = buildSearchParams(facilityDTO, pageable);
        List<FacilityDTO> facilities = facilityMapper.getFacilityList(paramMap);
        int totalCount = facilityMapper.getFacilityCount(paramMap);

        return new PageImpl<>(facilities, pageable, totalCount);
    }

    private Map<String, Object> buildSearchParams(FacilityDTO facilityDTO, PageRequest pageable) {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("s_terminalId", facilityDTO.getTerminalId());
        paramMap.put("s_terminalNm", facilityDTO.getTerminalName());
        paramMap.put("pageSize", pageable.getPageSize());
        paramMap.put("offset", (int) pageable.getOffset());
        return paramMap;
    }

    @Transactional(rollbackFor = Exception.class)
    public Boolean createFacility(FacilityDTO facilityDTO) {
        try {
            facilityMapper.createTerminal(facilityDTO);
            facilityMapper.createDevices(facilityDTO);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("터미널 및 디바이스 등록 실패", e);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Boolean updateFacility(FacilityDTO facilityDTO) {
        try {
            if (facilityDTO.isTerminalChange()) {
                facilityMapper.updateTerminal(facilityDTO);
            }
            if (facilityDTO.isDeviceChange()) {
                facilityMapper.updateDevices(facilityDTO);
            }

            return true;
        } catch (Exception e) {
            throw new RuntimeException("터미널 및 디바이스 수정 실패", e);
        }
    }

    @Transactional
    public Boolean deleteFacility(FacilityDTO facilityDTO) {
        List<String> deleteList = facilityDTO.getTerminalIdList();

        if (deleteList != null && deleteList.isEmpty()) {
            return false;
        }

        int result = facilityMapper.deleteFacility(facilityDTO);
        if (result > 0) {
            return true;
        }

        throw new IllegalStateException("삭제할 데이터가 없습니다");
    }

    public boolean isDuplicateId(FacilityDTO facilityDTO) {
        FacilityDTO idData = facilityMapper.findId(facilityDTO);
        return idData != null;
    }

    public List<FacilityDTO> getTerminalList(FacilityDTO facilityDTO) {
        try {
            List<FacilityDTO> terminalList = facilityMapper.getTerminalList(facilityDTO);
            enrichNetworkStatus(terminalList);
            return terminalList;
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }

    public List<NetworkEventLogDTO> getRecentNetworkEvents(String terminalId) {
        return terminalNetworkMapper.getNetworkEventsByTerminalId(terminalId);
    }

    public Map<String, Integer> getDevicesCnt() {
        List<Map<String, Object>> resultList = facilityMapper.getDevicesCnt();

        Map<String, Integer> deviceMap = new HashMap<>();
        for (Map<String, Object> row : resultList) {
            String deviceName = (String) row.get("device_name");
            Integer count = ((Number) row.get("cnt")).intValue();
            deviceMap.put(deviceName, count);
        }

        return deviceMap;
    }

    private void enrichNetworkStatus(List<FacilityDTO> terminalList) {
        if (terminalList == null || terminalList.isEmpty()) {
            return;
        }

        List<String> terminalIds = terminalList.stream()
                .map(FacilityDTO::getTerminalId)
                .filter(id -> id != null && !id.trim().isEmpty())
                .collect(Collectors.toList());
        if (terminalIds.isEmpty()) {
            return;
        }

        Map<String, TerminalNetworkStatusDTO> statusMap = terminalNetworkMapper.getNetworkStatusesByTerminalIds(terminalIds)
                .stream()
                .collect(Collectors.toMap(TerminalNetworkStatusDTO::getTerminalId, Function.identity(), (left, right) -> right));

        Map<String, List<NetworkEventLogDTO>> eventMap = new HashMap<>();
        for (NetworkEventLogDTO eventLogDTO : terminalNetworkMapper.getNetworkEventsByTerminalIds(terminalIds)) {
            eventMap.computeIfAbsent(eventLogDTO.getTerminalId(), key -> new ArrayList<>());
            List<NetworkEventLogDTO> events = eventMap.get(eventLogDTO.getTerminalId());
            if (events.size() < 5) {
                events.add(eventLogDTO);
            }
        }

        for (FacilityDTO terminal : terminalList) {
            TerminalNetworkStatusDTO statusDTO = statusMap.get(terminal.getTerminalId());
            if (statusDTO != null) {
                terminal.setNetworkRetryCount(statusDTO.getNetworkRetryCount());
                terminal.setNetworkOutageStartedAt(statusDTO.getNetworkOutageStartedAt());
                terminal.setNetworkLastRecoveredAt(statusDTO.getNetworkLastRecoveredAt());
                terminal.setNetworkLastRebootRequestedAt(statusDTO.getNetworkLastRebootRequestedAt());
                terminal.setNetworkPendingEventCount(statusDTO.getNetworkPendingEventCount());
                terminal.setNetworkRetryIntervalSec(statusDTO.getNetworkRetryIntervalSec());
                terminal.setNetworkRebootThreshold(statusDTO.getNetworkRebootThreshold());
                terminal.setNetworkFailureReason(statusDTO.getNetworkFailureReason());
            }
            terminal.setNetworkEventLogs(eventMap.getOrDefault(terminal.getTerminalId(), new ArrayList<>()));
        }
    }
}
