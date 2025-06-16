package com.archivsoft.sbms.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import java.util.Collection;
import java.util.Collections;

import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Comment("사용자 아이디")
    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    @Comment("사용자 이름")
    @Column(name = "user_name", length = 100, nullable = false)
    private String userName;

    @Comment("사용자 패스워드")
    @Column(name = "user_password", length = 200, nullable = false)
    @JsonIgnore
    private String userPassword;

    @Comment("사용자 이메일")
    @Column(name = "user_email", length = 50, nullable = false)
    private String userEmail;

    @Comment("사용자 휴대폰 전화번호")
    @Column(name = "user_telno", length = 50, nullable = false)
    private String userTelno;

    @Comment("사용여부")
    @Column(name = "use_yn", nullable = false)
    private String useYn;

    @CreationTimestamp
    @Comment("사용자 등록일자")
    @Column(name = "created_at", updatable = false, nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Comment("사용자 수정일자")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}