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

        // 최신 weather 1건만 조회
        WeatherAirQuality latest = weatherAirQualityMapper.getLatestWeather();

        // 상태 리스트 조회
        List<WeatherAirQualityStatus> list = weatherAirQualityMapper.getWeatherStatusOnly();

        for (WeatherAirQualityStatus s : list) {
            String name = s.getDisplayName();

            switch (name) {
                case "T1H": s.setCurrentValue(latest.getT1H() + " °C"); break;
                case "RN1": s.setCurrentValue(latest.getRN1() + " mm"); break;
                case "REH": s.setCurrentValue(latest.getREH() + " %"); break;
                case "WSD": s.setCurrentValue(latest.getWSD() + " m/s"); break;

                case "so2Value": s.setCurrentValue(latest.getSo2Value() + " ppm"); break;
                case "coValue":  s.setCurrentValue(latest.getCoValue()  + " ppm"); break;
                case "o3Value":  s.setCurrentValue(latest.getO3Value()  + " ppm"); break;
                case "no2Value": s.setCurrentValue(latest.getNo2Value() + " ppm"); break;

                case "pm10Value": s.setCurrentValue(latest.getPm10Value() + " μg/m³"); break;
                case "khaiValue": s.setCurrentValue(latest.getKhaiValue() + " μg/m³"); break;

                default: s.setCurrentValue(null);
            }
        }

        return list;
    }



    // 특정 대기질 상태 업데이트
    public void updateWeatherStatus(WeatherAirQualityStatus weatherAirQualityStatus) {
        weatherAirQualityMapper.updateWeatherStatus(weatherAirQualityStatus);
    }
}
