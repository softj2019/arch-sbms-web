package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.UserDTO;
import com.archivsoft.sbms.dto.UserHistoryDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserMapper {

//     사용자 조회
    List<UserDTO> getUser(Map<String, Object> paramMap);

//     사용자 총 개수 조회
    int getUserCount(Map<String, Object> paramMap);

//    아이디 중복확인
    String findId(String userId);

//    사용자 등록
    int createUser(UserDTO userDTO);

//    사용자 삭제
    int deleteUser(UserDTO userDTO);

//    사용자 수정
    int updateUser(UserDTO userDTO);

//    사용자 접속 이력 조회
    List<UserHistoryDTO> getLoginHistory(Map<String, Object> paramMap);
    int getLoginHistoryCount(Map<String, Object> paramMap);

//    사용자 접속 이력 저장
    int insertLoginHistory(UserHistoryDTO userHistoryDTO);

//    사용자 일별 접속 현황
    int getTodayVisit();

//    사용자 주별 접속 현황
    int getWeekVisit();

//    사용자 월별 접속 현황
    int getMonthVisit();
}

