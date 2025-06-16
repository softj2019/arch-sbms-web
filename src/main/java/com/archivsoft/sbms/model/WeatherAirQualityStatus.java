package com.archivsoft.sbms.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WeatherAirQualityStatus {
    private int id;
    private Long stationId;
    private String displayName;
    private String displayDescription;
    private Integer isActive;
    private LocalDateTime updatedAt;

    private String currentValue;
}
