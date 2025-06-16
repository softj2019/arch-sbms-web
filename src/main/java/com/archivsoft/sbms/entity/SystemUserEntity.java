package com.archivsoft.sbms.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "tb_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemUserEntity implements UserDetails, Serializable {

    @Id

    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    @Column(name = "user_nm", length = 100, nullable = false)
    private String userNm;

    @Column(name = "user_password", length = 200, nullable = false)
    @JsonIgnore
    private String userPassword;

    @Column(name = "user_email", length = 50, nullable = false)
    private String userEmail;

    @Column(name = "user_telno", length = 50, nullable = false)
    private String userTelno;

    @Column(name = "use_yn", nullable = false)
    private String useYn;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
//        return Collections.singleton((GrantedAuthority) () -> role.getRoleName());
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + this.getRole().getRoleName()));
    }
    @Override
    public String getPassword() {
        return userPassword;
    }

    @Override
    public String getUsername() {
        return userId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (true: 만료되지 않음)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠금 여부 (true: 잠기지 않음)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명 만료 여부 (true: 만료되지 않음)
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화 여부 (true: 활성화됨)
    }


}