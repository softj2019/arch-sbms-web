package com.archivsoft.sbms.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_hid_log")
@Data
@Builder // ✅ 이 부분 추가!
@NoArgsConstructor
@AllArgsConstructor
public class HidLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "terminal_id", nullable = false)
    private String terminalId;

    @Column(name = "people_count", nullable = false)
    private Integer peopleCount;

    @Column(name = "stat_people_count", nullable = false)
    private Integer statPeopleCount;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
