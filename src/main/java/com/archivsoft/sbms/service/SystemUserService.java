package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.UserDTO;
import com.archivsoft.sbms.dto.UserHistoryDTO;
import com.archivsoft.sbms.mapper.UserMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SystemUserService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    public SystemUserService(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    /**
     * 사용자 조회
     * 클라이언트로부터 넘어온 값(id, name, email) 에 대한 like 검색
     */
    public Page<UserDTO> getUserList(UserDTO userDTO, PageRequest pageable) {
        // 검색 조건 추출
        Map<String, Object> paramMap = buildSearchParams(userDTO, pageable);

        // 사용자 리스트 및 카운트 조회
        List<UserDTO> users = userMapper.getUser(paramMap);
        int totalCount = userMapper.getUserCount(paramMap);

        return new PageImpl<>(users, pageable, totalCount);
    }

    // paramMap 전처리
    private Map<String, Object> buildSearchParams(UserDTO userDTO, PageRequest pageable) {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("i_userId"     ,userDTO.getUserId());
        paramMap.put("i_userName"   ,userDTO.getUserNm());
        paramMap.put("i_userEmail"  ,userDTO.getUserEmail());
        paramMap.put("i_s_date"     ,userDTO.getStartDate());
        paramMap.put("i_e_date"     ,processEndDate(userDTO.getEndDate()));
        paramMap.put("pageSize"     ,pageable.getPageSize());
        paramMap.put("offset"       ,(int) pageable.getOffset());
        return paramMap;
    }

    // 종료일자 전처리
    private String processEndDate(String endDate) {
        if (endDate == null || endDate.isEmpty()) {
            return endDate;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate date = LocalDate.parse(endDate, formatter);

        // 로직상 선택일 23:59:59 까지 검색되기에 날짜를 +1 처리하여 반환
        return date.plusDays(1).format(formatter);
    }

    /**
     * 아이디 중복확인
     */
    public boolean isDuplicateId(String userId) {
        String idData = userMapper.findId(userId);
        return idData != null;
    }

    /**
     * 사용자 등록
     * */
    @Transactional
    public Boolean createUser(UserDTO userDTO) {
        // 상태값 할당
        userDTO.setUseYn("Y");

        // 비밀번호 암호화
        String bcryptPw = passwordEncoder.encode(userDTO.getUserPassword());
        userDTO.setUserPassword(bcryptPw);

        int result = userMapper.createUser(userDTO);
        if (result == 1) {
            return true;
        } else {
            throw new IllegalStateException("적용 대상 row 수가 적절하지 않습니다.");
        }
    }

    /**
     * 사용자 삭제
     * */
    @Transactional
    public Boolean deleteUser(UserDTO userDTO) {
        List<String> deleteList = userDTO.getUserIdList();

        // 전체 삭제 방지
        if (deleteList == null || deleteList.isEmpty()) {
            return false;
        } else {
            int result = userMapper.deleteUser(userDTO);

            if (result > 0){
                return true;
            } else {
                throw new IllegalStateException("삭제한 데이터 없음");
            }
        }
    }

    /**
     * 사용자 수정
     * */
    @Transactional
    public Boolean updateUser(UserDTO userDTO) {
        String updatedUserId = userDTO.getUserId();
        String updatedUserPw = userDTO.getUserPassword();

        if (updatedUserId == null || updatedUserId.isEmpty()) {
            return false;

        } else {
            // 비밀번호 수정시 암호화
            if(updatedUserPw != null && !updatedUserPw.isEmpty()) {
                String bcryptPw = passwordEncoder.encode(updatedUserPw);
                userDTO.setUserPassword(bcryptPw);
            }

            int result = userMapper.updateUser(userDTO);
            if (result == 1) {
                return true;
            } else {
                throw new IllegalStateException("적용 대상 row 수가 적절하지 않습니다.");
            }
        }
    }

    /**
     * 사용자 접속 이력
     * */
    public Page<UserHistoryDTO> getUserLoginHistory(UserHistoryDTO filter, PageRequest pageable) {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("i_userId", filter.getUserId());
        paramMap.put("i_userNm", filter.getUserNm());
        paramMap.put("i_client_ip", filter.getClientIp());
        paramMap.put("pageSize", pageable.getPageSize());
        paramMap.put("offset", pageable.getOffset());

        List<UserHistoryDTO> list = userMapper.getLoginHistory(paramMap);
        int count = userMapper.getLoginHistoryCount(paramMap);

        return new PageImpl<>(list, pageable, count);
    }

    /**
     * 사용자 접속 현황
     */
    public int getTodayVisit() {
        return userMapper.getTodayVisit();
    }

    public int getWeekVisit() {
        return userMapper.getWeekVisit();
    }

    public int getMonthVisit() {
        return userMapper.getMonthVisit();
    }
}
