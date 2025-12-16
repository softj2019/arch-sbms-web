package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.ControlAllowedIpDTO;
import com.archivsoft.sbms.entity.SystemUserEntity;
import com.archivsoft.sbms.mapper.ControlAllowedMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
            throw new RuntimeException("허용 IP 리스트 로드 실패", e);
        }
    }

    // 허용 IP 생성
    @Transactional(rollbackFor = Exception.class)
    public void createControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        Integer affectedRow = 0;
        String defaultMessage = "허용 IP 생성 중 오류 발생";
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setCreateUserId(systemUserEntity.getUserId());
            allowedIpDTO.setUpdateUserId(systemUserEntity.getUserId());
            allowedIpDTO.setUseFlag(1);

            // 공백 존재 가능성 있는 데이터 trim 처리
            allowedIpDTO.normalize();

            affectedRow = controlAllowedMapper.createAllowedIp(allowedIpDTO);
        }
        catch (DuplicateKeyException e) {
            defaultMessage = "중복 IP 에러 발생";
            log.error(defaultMessage + " : {}", e.getMessage(), e);
            throw new RuntimeException(defaultMessage, e);
        }
        catch (Exception e) {
            log.error(defaultMessage + " : {}", e.getMessage(), e);
            throw new RuntimeException(defaultMessage, e);
        }

        // 적용된 로우가 없을 경우
        if(affectedRow == null || !affectedRow.equals(1)) {
            String detailMessage = "적용된 row수가 올바르지 않음. expected = 1, actual = " + affectedRow;
            // 명시적으로 발생시키는 Exception 이므로 메세지를 임의로 생성
            log.error(defaultMessage + " : {}", detailMessage);
            throw new IllegalStateException(defaultMessage);
        }
    }

    // 허용 IP 수정
    @Transactional(rollbackFor = Exception.class)
    public void updateControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        Integer affectedRow = 0;
        String defaultMessage = "허용 IP 수정 중 오류 발생";
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setUpdateUserId(systemUserEntity.getUserId());

            // 공백 존재 가능성 있는 데이터 trim 처리
            allowedIpDTO.normalize();

            affectedRow = controlAllowedMapper.updateAllowedIp(allowedIpDTO);
        }
        catch (DuplicateKeyException e) {
            defaultMessage = "중복 IP 에러 발생";
            log.error(defaultMessage + " : {}", e.getMessage(), e);
            throw new RuntimeException(defaultMessage, e);
        }
        catch (Exception e) {
            log.error(defaultMessage + " : {}", e.getMessage(), e);
            throw new RuntimeException(defaultMessage, e);
        }

        // 적용된 로우가 없을 경우, 화면 보는 중 삭제된 로우 발생
        if(affectedRow == null || !affectedRow.equals(1)) {
            String detailMessage = "적용된 row수가 올바르지 않음. expected = 1, actual = " + affectedRow;
            // 명시적으로 발생시키는 Exception 이므로 메세지를 임의로 생성
            log.error(defaultMessage + " : {}", detailMessage);
            throw new IllegalStateException(defaultMessage);
        }
    }

    // 허용 IP 삭제
    @Transactional(rollbackFor = Exception.class)
    public void deleteControlAllowedIp(ControlAllowedIpDTO allowedIpDTO) {
        Integer affectedRow = 0;
        String defaultMessage = "허용 IP 삭제 중 오류 발생";
        try {
            SystemUserEntity systemUserEntity = (SystemUserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            allowedIpDTO.setUpdateUserId(systemUserEntity.getUserId());

            affectedRow = controlAllowedMapper.deleteAllowedIp(allowedIpDTO);
        } catch (RuntimeException e) {
            log.error(defaultMessage + " : {}", e.getMessage(), e);
            throw new RuntimeException(defaultMessage, e);
        }

        // 적용된 로우가 없을 경우, 화면 보는 중 삭제된 로우 발생
        if(affectedRow == null || !affectedRow.equals(1)) {
            String detailMessage = "적용된 row수가 올바르지 않음. expected = 1, actual = " + affectedRow;
            // 명시적으로 발생시키는 Exception 이므로 메세지를 임의로 생성
            log.error(defaultMessage + " : {}", detailMessage);
            throw new IllegalStateException(defaultMessage);
        }
    }

    // 허용 IP LIST 반환
    @Transactional(readOnly = true) // 외부에서 호출되는 메소드이므로 트랜잭션 처리
    public List<String> getIpListByUseFlag(int useFlag){
        List<ControlAllowedIpDTO> allowedIpDTOList = getAllAllowedIpListByUseFlag(useFlag);
        if(allowedIpDTOList.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> ipList = allowedIpDTOList.stream().map(dto -> dto.getIp()).collect(Collectors.toList());
        return ipList;
    }

    // 허용 IP STRING 반환
    @Transactional(readOnly = true) // 외부에서 호출되는 메소드이므로 트랜잭션 처리
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

    // useFlag 조건으로 모든 허용 IP 조회
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

    @Transactional(readOnly = true) // 외부에서 호출되는 메소드이므로 트랜잭션 처리
    public boolean isDuplicatedIp(ControlAllowedIpDTO allowedIpDTO) {
        ControlAllowedIpDTO ipData = controlAllowedMapper.findIp(allowedIpDTO);
        return ipData != null;
    }
}
