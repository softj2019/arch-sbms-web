package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.common.ResponseHandler;
import com.archivsoft.sbms.dto.SettingDTO;
import com.archivsoft.sbms.model.WeatherAirQuality;
import com.archivsoft.sbms.service.SettingService;
import com.archivsoft.sbms.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.faces.render.ResponseStateManager;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/setting")
public class SettingRestControler {
    private final SettingService settingService;
    private final ResponseHandler responseHandler;
    private final WeatherService weatherService;

    // kyh, 수정 불필요로 보임, 기존 세팅 데이터는 남기되 허용 IP만 제외하면 화면단에서 알아처리 예상이지만 확인 필요
    /**
     * 기본 설정값 조회
     * */
    @GetMapping("list")
    public ResponseEntity<List<SettingDTO>> getSetting() {
        List<SettingDTO> settingDTOList = settingService.getSetting();
        
        // 최근 기온 데이터 추가
        String t1h = weatherService.getRecentWeatherData()
                    .stream()
                    .findFirst()
                    .map(weather -> String.valueOf(weather.getT1H()))
                    .orElse("");

        settingDTOList.forEach(setting -> setting.setT1h(t1h));

        return ResponseEntity.ok(settingDTOList);
    }

    /**
     * 기본 설정값 변경
     * */
    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateSetting(
            @RequestBody List<Map<String, Object>> settingMapList,
            @ModelAttribute("userDetails") Map<String, Object> userDetails
    ){
        Map<String, Object> response = new HashMap<>();
        String userId = userDetails.get("userId") != null
                                                   ? userDetails.get("userId").toString()
                                                   : "";
        response.put("userId", userId);

        if (userId.isEmpty()) {
            return responseHandler.generateResponse(false, null,null, response);
        } else {
            settingService.updateSetting(settingMapList);

            return responseHandler.generateResponse(true, null,null, response);
        }
    }
}
