package com.archivsoft.sbms.service;

import com.archivsoft.sbms.mapper.WeatherAirQualityMapper;
import com.archivsoft.sbms.model.WeatherAirQuality;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;

@Service
@RequiredArgsConstructor
public class WeatherService {
    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    private final WeatherInsertDataService weatherInsertDataService;

    private final WeatherAirQualityMapper weatherMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String WEATHER_URL_TEMPLATE =
            "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst?pageNo=1&numOfRows=8&dataType=JSON&base_date=%s&base_time=%s&nx=59&ny=122&authKey=KQ00NwioTM2NNDcIqIzNNg";
    private static final String AIR_QUALITY_URL =
            "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=g04XaK6PzqpKNj1cvqFZCi3EDwXQdZuCOVorspjkVcxpvUOMXY4BHMfp4%2B8HP%2FfAgpocmdyF1kPdRVQxnEv3FA%3D%3D&returnType=json&numOfRows=1&pageNo=1&stationName=%EC%82%B0%EB%B3%B8%EB%8F%99&dataTerm=DAILY&ver=1.1";

    /**
     * 10분마다 기상 및 대기질 데이터를 가져와 저장
     */
    @Scheduled(fixedRate = 1000 * 60 * 10)
    public void fetchAndSaveWeatherData() {
        LocalDateTime now = LocalDateTime.now();
        try {
            // 1시간 전 정각 계산
            LocalDateTime oneHourAgo = now.minusHours(1);
            String baseTime = oneHourAgo.format(DateTimeFormatter.ofPattern("HH00"));
            String baseDate = oneHourAgo.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            // API URL 생성
            String weatherUrl = String.format(WEATHER_URL_TEMPLATE, baseDate, baseTime);
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            URI uri = new URI(AIR_QUALITY_URL);

            // Weather API 호출
            logger.info("[WeatherService] Requesting weather API: {}", weatherUrl);
            ResponseEntity<String> weatherResponse = restTemplate.exchange(weatherUrl, HttpMethod.GET, null, String.class);
            logger.info("[WeatherService] Weather API status: {}", weatherResponse.getStatusCode());

            // AirQuality API 호출
            logger.info("[WeatherService] Requesting air quality API: {}", uri);
            ResponseEntity<String> airQualityResponse = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            logger.info("[WeatherService] AirQuality API status: {}", airQualityResponse.getStatusCode());

            // JSON 파싱
            JsonNode weatherJson = objectMapper.readTree(weatherResponse.getBody());
            JsonNode airQualityJson = objectMapper.readTree(airQualityResponse.getBody());

            if (weatherJson.path("response").isMissingNode()) {
                logger.error("[WeatherService] Invalid weather API response body: {}", weatherResponse.getBody());
                return;
            }
            if (airQualityJson.path("response").isMissingNode()) {
                logger.error("[WeatherService] Invalid air quality API response body: {}", airQualityResponse.getBody());
                return;
            }

            WeatherAirQuality data = new WeatherAirQuality();
            data.setStationId(1L);

            for (JsonNode item : weatherJson.path("response").path("body").path("items").path("item")) {
                String category = item.path("category").asText();
                double obsrValue = item.path("obsrValue").asDouble();
                switch (category) {
                    case "PTY": data.setPTY((int) obsrValue); break;
                    case "REH": data.setREH(obsrValue); break;
                    case "RN1": data.setRN1(obsrValue); break;
                    case "T1H": data.setT1H(obsrValue); break;
                    case "VEC": data.setVEC((int) obsrValue); break;
                    case "WSD": data.setWSD(obsrValue); break;
                }
            }

            JsonNode airQualityItem = airQualityJson.path("response").path("body").path("items").get(0);
            data.setSo2Grade(airQualityItem.path("so2Grade").asInt());
            data.setSo2Value(airQualityItem.path("so2Value").asDouble());
            data.setSo2Flag(airQualityItem.path("so2Flag").asText(null));

            data.setCoGrade(airQualityItem.path("coGrade").asInt());
            data.setCoValue(airQualityItem.path("coValue").asDouble());
            data.setCoFlag(airQualityItem.path("coFlag").asText(null));

            data.setNo2Grade(airQualityItem.path("no2Grade").asInt());
            data.setNo2Value(airQualityItem.path("no2Value").asDouble());
            data.setNo2Flag(airQualityItem.path("no2Flag").asText(null));

            data.setO3Grade(airQualityItem.path("o3Grade").asInt());
            data.setO3Value(airQualityItem.path("o3Value").asDouble());
            data.setO3Flag(airQualityItem.path("o3Flag").asText(null));

            data.setPm10Grade(airQualityItem.path("pm10Grade").asInt());
            data.setPm10Value(airQualityItem.path("pm10Value").asInt());
            data.setPm10Flag(airQualityItem.path("pm10Flag").asText(null));

            data.setKhaiValue(airQualityItem.path("khaiValue").asInt());
            data.setKhaiGrade(airQualityItem.path("khaiGrade").asInt());

            insertWeatherData(data);
            logger.info("[WeatherService] Weather/AirQuality data saved successfully at {}", now);

        } catch (ResourceAccessException e) {
            logger.error("[WeatherService] Network error (ResourceAccessException) at {}: {}", now, e.getMessage(), e);
        } catch (HttpClientErrorException e) {
            logger.error("[WeatherService] Client error ({}): {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (HttpServerErrorException e) {
            logger.error("[WeatherService] Server error ({}): {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("[WeatherService] Unexpected error at {}", now, e);
        }
    }

    /**
     * 최근 기상 데이터 select, 캐싱 처리
     */
    @Transactional(readOnly = true)
    @Cacheable(
            value = "latestWeatherCache",   // 캐시 이름
            key = "'latest'"                // 캐시 키
    )
    public List<WeatherAirQuality> getRecentWeatherData() {
        return weatherMapper.getRecentWeatherData();
    }

    // 어차피 내부 메소드인 fetchAndSaveWeatherData 에서 호출되는 메소이드이므로, @Transactional을 붙여도 실제 작동하지 않음.
    // 실제 @Transactional을 적용하고 싶다면, fetchAndSaveWeatherData 적용해야 하지만, 단일건에 대한 insert이므로 한번의 insert가 되지 않아도
    // 큰 문제 없으므로, 구태여 붙이지 않음
    /**
     * 기상 데이터 insert, 기존 캐싱 무효화
     */
    public void insertWeatherData(WeatherAirQuality weatherAirQuality) {
        weatherInsertDataService.insertWeatherData(weatherAirQuality);
    }
}
