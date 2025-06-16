package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.FacilityDTO;
import com.archivsoft.sbms.mapper.FacilityMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FacilityService {
    private final FacilityMapper facilityMapper;
    public FacilityService(FacilityMapper facilityMapper) {
        this.facilityMapper = facilityMapper;
    }
    /**
     * 시설물 현황 조회
     * */
    public Page<FacilityDTO> getFacilityList(FacilityDTO facilityDTO, PageRequest pageable) {
        // 검색 조건 추출
        Map<String, Object> paramMap = buildSearchParams(facilityDTO, pageable);

        // 시설물 리스트 및 카운트 조회
        List<FacilityDTO> facilities = facilityMapper.getFacilityList(paramMap);
        int totalCount = facilityMapper.getFacilityCount(paramMap);

        return new PageImpl<>(facilities, pageable, totalCount);
    }

    // paramMap 전처리
    private Map<String, Object> buildSearchParams(FacilityDTO facilityDTO, PageRequest pageable) {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("s_terminalId" ,facilityDTO.getTerminalId());
        paramMap.put("s_terminalNm" ,facilityDTO.getTerminalName());
        paramMap.put("pageSize"     ,pageable.getPageSize());
        paramMap.put("offset"       ,(int) pageable.getOffset());
        return paramMap;
    }

    /**
     * 터미널 및 디바이스 등록
     * */
    @Transactional(rollbackFor = Exception.class)
    public Boolean createFacility(FacilityDTO facilityDTO) {
        try {
            facilityMapper.createTerminal(facilityDTO); // 터미널 등록
            facilityMapper.createDevices(facilityDTO);  // 디바이스 등록
            return true;
        } catch (Exception e) {
            throw new RuntimeException("터미널 및 디바이스 등록 실패", e);
        }
    }

    /**
     * 터미널 및 디바이스 수정
     * */
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateFacility(FacilityDTO facilityDTO) {
        try{
            if (facilityDTO.isTerminalChange()) facilityMapper.updateTerminal(facilityDTO); // 터미널 테이블 변경
            if (facilityDTO.isDeviceChange())   facilityMapper.updateDevices(facilityDTO);  // 디바이스 테이블 변경

            return true;
        } catch (Exception e){
            throw new RuntimeException("터미널 및 디바이스 수정 실패", e);
        }
    }
    
    /**
     * 시설물 삭제
     * */
    @Transactional
    public Boolean deleteFacility(FacilityDTO facilityDTO) {
        List<String> deleteList = facilityDTO.getTerminalIdList();

        // 전체삭제 방지
        if (deleteList != null && deleteList.isEmpty()) {
            return false;
        } else {
            int result = facilityMapper.deleteFacility(facilityDTO);

            if (result > 0){
                return true;
            } else {
                throw new IllegalStateException("삭제한 데이터 없음");
            }
        }
    }

    /**
     * 시설물 중복확인
     */
    public boolean isDuplicateId(FacilityDTO facilityDTO) {
        FacilityDTO idData = facilityMapper.findId(facilityDTO);
        return idData != null;
    }

    /**
     * 정류장별 시설물 데이터 조회
     * */
    public List<FacilityDTO> getTerminalList(FacilityDTO facilityDTO){
        try{
            return facilityMapper.getTerminalList(facilityDTO);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 시설물별 보유 총계
     * */
    public Map<String, Integer> getDevicesCnt(){
        List<Map<String, Object>> resultList = facilityMapper.getDevicesCnt(); // selectList()로 변경됨

        // 결과를 Map<String, Integer>로 변환
        Map<String, Integer> deviceMap = new HashMap<>();
        for (Map<String, Object> row : resultList) {
            String deviceName = (String) row.get("device_name");
            Integer count = ((Number) row.get("cnt")).intValue();
            deviceMap.put(deviceName, count);
        }

        return deviceMap;
    }
}
