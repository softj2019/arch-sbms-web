package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.FacilityDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface FacilityMapper {

//    시설물 조회
    List<FacilityDTO> getFacilityList(Map<String, Object> paramMap);

//    시설물 총 개수 조회
    int getFacilityCount(Map<String, Object> paramMap);

//    터미널 생성
    void createTerminal(FacilityDTO facilityDTO);

//    디바이스 생성
    void createDevices(FacilityDTO facilityDTO);
    
//    터미널 이름 수정
    void updateTerminal(FacilityDTO facilityDTO);

//    디바이스 수정
    void updateDevices(FacilityDTO facilityDTO);

//    시설물 삭제
    int deleteFacility(FacilityDTO facilityDTO);

//    정류장 아이디 중복확인
    FacilityDTO findId(FacilityDTO facilityDTO);

//    정류장 모든 데이터 조회
    List<FacilityDTO> getTerminalList(FacilityDTO facilityDTO);

//    시설물별 보유 총계
    List<Map<String, Object>> getDevicesCnt();
}

