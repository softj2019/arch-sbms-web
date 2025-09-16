package com.archivsoft.sbms.service;

import com.archivsoft.sbms.mapper.WeatherAirQualityMapper;
import com.archivsoft.sbms.model.WeatherAirQuality;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
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
    private final WeatherAirQualityMapper weatherMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String WEATHER_URL_TEMPLATE = "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst?pageNo=1&numOfRows=8&dataType=JSON&base_date=%s&base_time=%s&nx=59&ny=122&authKey=KQ00NwioTM2NNDcIqIzNNg";
    private static final String AIR_QUALITY_URL = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=g04XaK6PzqpKNj1cvqFZCi3EDwXQdZuCOVorspjkVcxpvUOMXY4BHMfp4%2B8HP%2FfAgpocmdyF1kPdRVQxnEv3FA%3D%3D&returnType=json&numOfRows=1&pageNo=1&stationName=%EC%82%B0%EB%B3%B8%EB%8F%99&dataTerm=DAILY&ver=1.1";

    /**
     * 10초마다 기상 및 대기질 데이터를 가져와 저장
     */
    @Scheduled(fixedRate = 600000) // 10초마다 실행
//    @Scheduled(cron = "5 0 * * * *") // 매시 정각 5초 후 실행
    public void fetchAndSaveWeatherData() {
        try {
            // 현재 날짜 및 시간 가져오기
            LocalDateTime now = LocalDateTime.now();

            // 1시간 전 정각 계산
            LocalDateTime oneHourAgo = now.minusHours(1);
            String baseTime = oneHourAgo.format(DateTimeFormatter.ofPattern("HH00")); // HH00 형식
            String baseDate = oneHourAgo.format(DateTimeFormatter.ofPattern("yyyyMMdd")); // YYYYMMDD 형식

            // API URL 생성
            String weatherUrl = String.format(WEATHER_URL_TEMPLATE, baseDate, baseTime);
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            URI uri = new URI(AIR_QUALITY_URL);
            ResponseEntity<String> weatherResponse = restTemplate.exchange(weatherUrl, HttpMethod.GET, null, String.class);
            ResponseEntity<String> airQualityResponse = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

            JsonNode weatherJson = objectMapper.readTree(weatherResponse.getBody());
            JsonNode airQualityJson = objectMapper.readTree(airQualityResponse.getBody());

            if (weatherJson.path("response").isMissingNode()) {
                logger.error("Invalid weather API response: {}", weatherResponse.getBody());
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


            weatherMapper.insertWeatherData(data);


        } catch (Exception e) {
            logger.error("WeatherService fetchAndSaveWeatherData failed", e);
        }
    }

    public List<WeatherAirQuality> getRecentWeatherData() {
        return weatherMapper.getRecentWeatherData();
    }
}
