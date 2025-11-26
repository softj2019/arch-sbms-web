package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.model.WeatherAirQuality;
import com.archivsoft.sbms.model.WeatherAirQualityStatus;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface WeatherAirQualityMapper {

    // 데이터 저장
    void insertWeatherData(WeatherAirQuality weatherAirQuality);

    // 최근 데이터 조회
    List<WeatherAirQuality> getRecentWeatherData();

    // 특정 날짜 이후 데이터 조회
    List<WeatherAirQuality> getWeatherDataAfterDate(String date);

    // 대기질 상태 목록 조회
    List<WeatherAirQualityStatus> getAllWeatherStatuses();

    // 특정 station_id의 상태 업데이트 (어노테이션 제거 -> XML 기반)
    void updateWeatherStatus(WeatherAirQualityStatus weatherAirQualityStatus);

    WeatherAirQuality getLatestWeather();
    List<WeatherAirQualityStatus> getWeatherStatusOnly();
}
