package com.archivsoft.sbms.model;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@NoArgsConstructor
@Setter
@AllArgsConstructor
public class WeatherAirQuality {
    private Long id;
    private Long stationId;

    // 🌡️ 기온 및 강수량
    private Double T1H;
    private Double REH;
    private Double RN1;
    private Integer PTY;

    // 🌬️ 풍속 및 풍향
    private Integer VEC;
    private Double WSD;

    // 💨 대기질 데이터
    private Double so2Value;
    private Double coValue;
    private Double o3Value;
    private Double no2Value;
    private Integer pm10Value;

    // 📊 대기질 등급
    private Integer khaiValue;
    private Integer khaiGrade;
    private Integer so2Grade;
    private Integer coGrade;
    private Integer o3Grade;
    private Integer no2Grade;
    private Integer pm10Grade;

    // 🏴 데이터 신뢰도 플래그
    private String so2Flag;
    private String coFlag;
    private String o3Flag;
    private String no2Flag;
    private String pm10Flag;

    private String recordedAt;
}
