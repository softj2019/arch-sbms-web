package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.MonitoringDTO;
import com.archivsoft.sbms.mapper.MonitoringMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class MonitoringService {
    private final MonitoringMapper monitoringMapper;
    private final ObjectMapper objectMapper;

    public MonitoringService(MonitoringMapper monitoringMapper, ObjectMapper objectMapper) {
        this.monitoringMapper = monitoringMapper;
        this.objectMapper = objectMapper;
    }

    // JSON -> DTO 변환
    private MonitoringDTO convertJsonToDto(String message) {
        try {
            return objectMapper.readValue(message, MonitoringDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("JSON 변환 실패", e);
        }
    }

    // 데이터 전처리
    public void processMessage(String message) {
        MonitoringDTO monitoringDTO = convertJsonToDto(message);
        saveData(monitoringDTO);
    }

    // DB 저장
    public void saveData(MonitoringDTO monitoringDTO) {
        try {
            monitoringMapper.saveData(monitoringDTO);
        } catch(Exception e) {
            throw new RuntimeException("데이터 저장 실패");
        }
    }

    // 3일마다 테이블 초기화 작업 스케쥴링
    @Transactional
    @Scheduled(cron = "0 0 0 */3 * ?") // 3일마다 자정(00:00:00)에 실행
    public void truncateTable (){
        // TRUNCATE 실행
        monitoringMapper.truncateTable();
        log.info("TB_MONITORING 테이블 초기화 완료");
    }
}
