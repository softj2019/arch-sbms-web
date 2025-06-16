package com.archivsoft.sbms.service;

import com.archivsoft.sbms.mapper.WeatherAirQualityMapper;
import com.archivsoft.sbms.model.WeatherAirQuality;
import com.archivsoft.sbms.model.WeatherAirQualityStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WeatherAirQualityStatusService {

    @Autowired
    private WeatherAirQualityMapper weatherAirQualityMapper;

    // 전체 상태 목록 조회
    public List<WeatherAirQualityStatus> getAllWeatherStatuses() {
        List<WeatherAirQualityStatus> dataList = weatherAirQualityMapper.getAllWeatherStatuses();

        // 강수형태(pty)와 풍속(wsd) row 제거
        dataList.removeIf(data -> "pty".equalsIgnoreCase(data.getDisplayName()));
//        dataList.removeIf(data -> "khaiValue".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "khaiGrade".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "so2Grade".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "coGrade".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "o3Grade".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "no2Grade".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "pm10Grade".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "so2Flag".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "coFlag".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "o3Flag".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "no2Flag".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "pm10Flag".equalsIgnoreCase(data.getDisplayName()));
        dataList.removeIf(data -> "VEC".equalsIgnoreCase(data.getDisplayName()));

        // 풍향 -> 풍향,풍속 으로 합치기
        dataList.stream()
                .filter(data -> data.getId() == 5)
                .findFirst()
                .ifPresent(data -> data.setDisplayDescription("풍향•풍속"));

        return dataList;
    }


    // 특정 대기질 상태 업데이트
    public void updateWeatherStatus(WeatherAirQualityStatus weatherAirQualityStatus) {
        weatherAirQualityMapper.updateWeatherStatus(weatherAirQualityStatus);
    }
}
