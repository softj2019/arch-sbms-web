package com.archivsoft.sbms.service;

import com.archivsoft.sbms.common.ErrorCode;
import com.archivsoft.sbms.dto.ControlAllowedIpDTO;
import com.archivsoft.sbms.entity.SystemUserEntity;
import com.archivsoft.sbms.exception.CustomException;
import com.archivsoft.sbms.mapper.ControlAllowedMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ControlAllowedIpService {
    private final ControlAllowedMapper controlAllowedMapper;

    public ControlAllowedIpService(ControlAllowedMapper controlAllowedMapper) {
        this.controlAllowedMapper = controlAllowedMapper;
    }

    //kyh, 예외처리 필요
    public Page<ControlAllowedIpDTO> getControlAllowedIpList(PageRequest pageable) {
        try {
            Map<String, Object> paramMap = new HashMap<>();
            paramMap.put("pageSize", pageable.getPageSize());
            paramMap.put("offset", (int) pageable.getOffset());

            List<ControlAllowedIpDTO> controlAllowedList = controlAllowedMapper.getAllowedIpList(paramMap);
            Integer totalCount = controlAllowedMapper.getAllowedIpCount(paramMap);
            PageImpl<ControlAllowedIpDTO> allowedIpPage = new PageImpl<>(controlAllowedList, pageable, totalCount);

            return allowedIpPage;
        } catch (RuntimeException e) {
            log.error("허용 IP 리스트 로드 중 오류 발생 : {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR.getMessage(), e.getCause(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //kyh, 예외처리 필요
    @Transactional(rollbackFor = Exception.class)
    public void createControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setCreateUserId(systemUserEntity.getUserId());
            allowedIpDTO.setUseFlag(1);

            //kyh, 적용 row 결과값 예외 필요
            Integer affectedRow = controlAllowedMapper.createAllowedIp(allowedIpDTO);
            if(affectedRow != null && affectedRow == 1) {

            }
            else {

            }
        } catch (RuntimeException e) {
            log.error("허용 IP 생성 중 오류 발생 : {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR.getMessage(), e.getCause(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setUpdateUserId(systemUserEntity.getUserId());

            //kyh, 적용 row 결과값 예외 필요
            Integer affectedRow = controlAllowedMapper.updateAllowedIp(allowedIpDTO);
            if(affectedRow != null && affectedRow == 1) {

            }
            else {

            }
        } catch (RuntimeException e) {
            log.error("허용 IP 수정 중 오류 발생 : {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR.getMessage(), e.getCause(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setUpdateUserId(systemUserEntity.getUserId());

            //kyh, 적용 row 결과값 예외 필요
            Integer affectedRow = controlAllowedMapper.deleteAllowedIp(allowedIpDTO);
            if(affectedRow != null && affectedRow == 1) {

            }
            else {

            }
        } catch (RuntimeException e) {
            log.error("허용 IP 삭제 중 오류 발생 : {}", e.getMessage(), e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR.getMessage(), e.getCause(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
