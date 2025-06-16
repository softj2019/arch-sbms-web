package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.ControlDTO;
import com.archivsoft.sbms.mapper.ControlMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ControlService {
    private final ControlMapper controlMapper;

    @Transactional
    public Boolean addLog(ControlDTO controlDTO){
        try {
            controlMapper.addLog(controlDTO);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("스크린제어 로그 작성 실패", e);
        }
    }
}
