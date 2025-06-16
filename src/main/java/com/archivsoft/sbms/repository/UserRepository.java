package com.archivsoft.sbms.repository;


import com.archivsoft.sbms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // 사용자 동적 조회
    boolean existsByUserId(String userId);
}
