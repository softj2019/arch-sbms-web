package com.archivsoft.sbms.entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
@Entity
@Table(name = "tb_role")
@Getter
@Setter
@NoArgsConstructor
public class Role implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId; // 권한 ID

    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName; // 권한 이름

    @Column(name = "description", length = 255)
    private String description; // 권한 설명
}