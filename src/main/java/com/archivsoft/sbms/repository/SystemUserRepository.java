package com.archivsoft.sbms.repository;

import com.archivsoft.sbms.entity.SystemUserEntity;
import com.archivsoft.sbms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemUserRepository extends JpaRepository<SystemUserEntity, String> {

    /**
     * 검색 조건에 따른 사용자 조회
     * @param userId 사용자 아이디 (옵션)
     * @param userNm 사용자 이름 (옵션)
     * @param userEmail 사용자 이메일 (옵션)
     * @param startDate 등록일 시작일자 (옵션)
     * @param endDate 등록일 종료일자 (옵션)
     * @return 검색 조건에 맞는 사용자 목록
     */
    @Query("SELECT u FROM SystemUserEntity u " +
            "WHERE (:userId IS NULL OR u.userId LIKE %:userId%) " +
            "AND (:userNm IS NULL OR u.userNm LIKE %:userNm%) " +
            "AND (:userEmail IS NULL OR u.userEmail LIKE %:userEmail%) " +
            "AND (:startDate IS NULL OR u.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR u.createdAt <= :endDate)")
    List<SystemUserEntity> findUsersBySearchCriteria(
            @Param("userId") String userId,
            @Param("userNm") String userNm,
            @Param("userEmail") String userEmail,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    SystemUserEntity findUserByUserId(String userId);
}
