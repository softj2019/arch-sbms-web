package com.archivsoft.sbms.controller.api;
import com.archivsoft.sbms.model.WeatherAirQuality;
import com.archivsoft.sbms.model.WeatherAirQualityStatus;
import com.archivsoft.sbms.service.WeatherAirQualityStatusService;
import com.archivsoft.sbms.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/air")
public class AirQualityRestController {
    @Autowired
    private WeatherAirQualityStatusService statusService;
    @Autowired
    private WeatherService weatherService;

    // 대기질 상태 목록 조회 API
    @GetMapping("/status")
    public List<WeatherAirQualityStatus> getAllStatuses() {
        return statusService.getAllWeatherStatuses();
    }

    // 대기질 상태 수정 API
    @PutMapping("/status/{id}")
    public Map<String, String> updateStatus(
            @PathVariable int id,
            @RequestBody WeatherAirQualityStatus WeatherAirQualityStatus) {

        WeatherAirQualityStatus.setId(id); // PathVariable 값을 객체에 설정
        statusService.updateWeatherStatus(WeatherAirQualityStatus);

        // Java 1.8 호환을 위해 Map.of() 대신 HashMap 사용
        Map<String, String> response = new HashMap<>();
        response.put("message", "수정 완료되었습니다.");
        return response;
    }
    /**
     * 최근 대기질 데이터 조회 API
     * @return 가장 최신의 대기질 데이터 1건 반환
     */
    @GetMapping("/recent")
    public WeatherAirQuality getRecentWeatherStatus() {
        List<WeatherAirQuality> weatherAirQualities = weatherService.getRecentWeatherData();

        // 최신 데이터가 없을 경우 빈 객체 반환
        return weatherAirQualities.isEmpty() ? new WeatherAirQuality() : weatherAirQualities.get(0);
    }
}
