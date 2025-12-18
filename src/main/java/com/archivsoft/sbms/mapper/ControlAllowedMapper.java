package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.ControlAllowedIpDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface ControlAllowedMapper {

//    허용 IP 리스트 조회
    List<ControlAllowedIpDTO> getAllowedIpList(Map<String, Object> paramMap);

//    전체 로우 조회
    Integer getAllowedIpCount(Map<String, Object> paramMap);

//    허용 IP 등록
    Integer createAllowedIp(ControlAllowedIpDTO controlAllowedIpDTO);

//    허용 IP 수정
    Integer updateAllowedIp(ControlAllowedIpDTO controlAllowedIpDTO);

//    허용 IP 삭제
    Integer deleteAllowedIp(ControlAllowedIpDTO controlAllowedIpDTO);

//    UseFlag 조건으로 허용된 IP 전체 조회
    List<ControlAllowedIpDTO> getAllAllowedIpListByUseFlag(Map<String, Object> paramMap);

//    ip 중복 체크
    ControlAllowedIpDTO findIp(ControlAllowedIpDTO controlAllowedIpDTO);
}

