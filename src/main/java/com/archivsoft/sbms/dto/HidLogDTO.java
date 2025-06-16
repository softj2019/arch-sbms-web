package com.archivsoft.sbms.dto;

import com.archivsoft.sbms.entity.HidLog;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HidLogDTO {
    private Integer id;
    private String terminalId;
    private Integer peopleCount;
    private Integer statPeopleCount;
    private String fileName;
    private String timestamp;
    private Integer month;
    private String terminalNm;
    public LocalDateTime getParsedTimestamp() {
        return timestamp != null && !timestamp.isEmpty() ? parseDate(timestamp) : null;
    }

    public static String formatTimestamp(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : null;
    }

    private static LocalDateTime parseDate(String date) {
        if (date == null || date.isEmpty()) return null;

        // ✅ 소수점 이하 초(.S) 처리
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss[.S]");
        return LocalDateTime.parse(date, formatter);
    }

    public static HidLogDTO fromEntity(HidLog log) {
        return HidLogDTO.builder()
                .id(log.getId())
                .terminalId(log.getTerminalId())
                .peopleCount(log.getPeopleCount())
                .statPeopleCount(log.getStatPeopleCount())
                .fileName(log.getFileName())
                .timestamp(formatTimestamp(log.getTimestamp()))
                .build();
    }

    // ✅ `HidLogDTO`를 `HidLog` 엔티티로 변환하는 메서드
    public HidLog toEntity() {
        return HidLog.builder()
                .id(id)
                .terminalId(terminalId)
                .peopleCount(peopleCount)
                .statPeopleCount(statPeopleCount)
                .fileName(fileName)
                .timestamp(getParsedTimestamp())
                .build();
    }
}
