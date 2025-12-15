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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ControlAllowedIpService {
    private final ControlAllowedMapper controlAllowedMapper;

    public ControlAllowedIpService(ControlAllowedMapper controlAllowedMapper) {
        this.controlAllowedMapper = controlAllowedMapper;
    }

    // 허용 IP 리스트 조회 (페이지네이션)
    @Transactional(readOnly = true)
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

    // 허용 IP 생성
    @Transactional(rollbackFor = Exception.class)
    public void createControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setCreateUserId(systemUserEntity.getUserId());
            allowedIpDTO.setUseFlag(1);

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

    // 허용 IP 수정
    @Transactional(rollbackFor = Exception.class)
    public void updateControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setUpdateUserId(systemUserEntity.getUserId());

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

    // 허용 IP 삭제
    @Transactional(rollbackFor = Exception.class)
    public void deleteControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setUpdateUserId(systemUserEntity.getUserId());

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

    // useFlag 조건으로 모든 허용 IP 조회
    @Transactional(readOnly = true)
    public List<ControlAllowedIpDTO> getAllAllowedIpListByUseFlag(int useFlag) {
        List<ControlAllowedIpDTO> result;
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("useFlag", useFlag);

        // NULL 반환 방지
        result = controlAllowedMapper.getAllAllowedIpListByUseFlag(paramMap);
        if(result == null || result.isEmpty()) {
            result = Collections.emptyList();
        }
        return result;
    }

    // 허용 IP LIST 반환
    public List<String> getIpListByUseFlag(int useFlag){
        List<ControlAllowedIpDTO> allowedIpDTOList = getAllAllowedIpListByUseFlag(useFlag);
        if(allowedIpDTOList.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> ipList = allowedIpDTOList.stream().map(dto -> dto.getIp()).collect(Collectors.toList());
        return ipList;
    }

    // 허용 IP STRING 반환
    public String getIpOneLineStringByUseFlag(int useFlag) {
        List<ControlAllowedIpDTO> allowedIpDTOList = getAllAllowedIpListByUseFlag(useFlag);
        if(allowedIpDTOList.isEmpty()) {
            return "";
        }
        String result = allowedIpDTOList.stream()
                .map(ControlAllowedIpDTO::getIp)
                .collect(Collectors.joining(", "));
        return result;
    }

    @Transactional(readOnly = true)
    public boolean isDuplicatedIp(ControlAllowedIpDTO allowedIpDTO) {
        ControlAllowedIpDTO ipData = controlAllowedMapper.findIp(allowedIpDTO);
        return ipData != null;
    }
}
