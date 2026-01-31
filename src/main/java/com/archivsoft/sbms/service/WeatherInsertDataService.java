package com.archivsoft.sbms.service;

import com.archivsoft.sbms.mapper.WeatherAirQualityMapper;
import com.archivsoft.sbms.model.WeatherAirQuality;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// 본 클래스는 기상 데이터를 Insert 하는 용도로만 사용되는 클래스로,
// 기존 WeatherService 내부에서 내부 메소드를 호출하던 구조로 인해, insert시 캐시가 무효화 되지 않던 이슈로
// /weather 페이지에서 기상 데이터가 업데이트 되지 않던 이슈의 처리를 위함.
// Spring 프레임워의 AOP(프록시) 기능에서 클래스 내부 메소드 호출시 @CacheEvict 가 작용하지 않는 원인으로 별도 분리.
@Service
@RequiredArgsConstructor
public class WeatherInsertDataService {

    private final WeatherAirQualityMapper weatherMapper;

    @Transactional
    @CacheEvict(
            value = "latestWeatherCache",   // 캐시 이름
            allEntries = true               // 캐시 내 모든 엔트리
    )
    public void insertWeatherData(WeatherAirQuality weatherAirQuality) {
        weatherMapper.insertWeatherData(weatherAirQuality);
    }
}
