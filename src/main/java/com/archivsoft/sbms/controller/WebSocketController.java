package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.dto.SettingDTO;
import com.archivsoft.sbms.service.HidLogService;
import com.archivsoft.sbms.service.MonitoringService;
import com.archivsoft.sbms.service.SettingService;
import com.archivsoft.sbms.service.WeatherService;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.reactive.socket.server.WebSocketService;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Slf4j
@Controller
public class WebSocketController {
    private final MonitoringService monitoringService;
    private final HidLogService hidLogService;
    private final SettingService settingService;
    private final WeatherService weatherService;
    public WebSocketController(
            MonitoringService monitoringService,
            HidLogService hidLogService,
            SettingService settingService,
            WeatherService weatherService
    ) {
        this.monitoringService = monitoringService;
        this.hidLogService = hidLogService;
        this.settingService = settingService;
        this.weatherService = weatherService;
    }

    @MessageMapping("/iot/overview")
    @SendTo("/topic/dashboard")
    public String handleData(String message) {
        try{
            // 소켓 데이터 db 저장
            monitoringService.processMessage(message);
        } catch (Exception ignored){
            // 아무 행동도 하지 않음
        }

        return message;
    }

    @MessageMapping("/iot/screen/action")
    @SendTo("/topic/screen/action")
    public Map<String, String> controlScreenAction(Map<String, String> payload) {
        String terminalId = payload.get("terminalId");
        String action = payload.get("action");
        String status = payload.get("status");
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        response.put("terminalId", terminalId);
        response.put("action", action);
        response.put("message", "Screen action processed successfully");

        return response;
    }

    @MessageMapping("/iot/power/action")
    @SendTo("/topic/power/action")
    public Map<String, String> controlPowerAction(Map<String, String> payload) {
        String terminalId = payload.get("terminalId");
        String action = payload.get("action");
        String device = payload.get("device");
        String status = payload.get("status");
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        response.put("terminalId", terminalId);
        response.put("action", action);
        response.put("device", device);
        response.put("message", "power action processed successfully");

        return response;
    }
    @MessageMapping("/iot/led/send")
    @SendTo("/topic/led/send")
    public Map<String, String> controlLedDisplay(Map<String, String> payload) {
        String action = payload.get("action");
        String status = payload.get("status");
        String sendMessage = payload.get("sendMessage");
        String color = payload.get("color");
        String font = payload.get("font");
        String weight= payload.get("weight");
        String eff= payload.get("eff");
        String ysz= payload.get("ysz");
        String fix= payload.get("fix");
        String emergencyMessageStatus= payload.get("emergencyMessageStatus");
        String dly_interval= payload.get("dly_interval");
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        response.put("sendMessage", sendMessage);
        response.put("color", color);
        response.put("font", font);
        response.put("weight", weight);
        response.put("eff", eff);
        response.put("ysz", ysz);
        response.put("fix", fix);
        response.put("dly_interval", dly_interval);
        response.put("emergencyMessageStatus", emergencyMessageStatus);

        return response;
    }
    @MessageMapping("/cv/stream")
    @SendTo("/topic/cv/stream")
    public Map<String, Object> handleStream(@Payload Map<String, Object> frameData) {
        return frameData;
    }
    @MessageMapping("/udp/data")
    @SendTo("/topic/udp/data")
    public String handleUdpData(String message) {
        return message;
    }

    @MessageMapping("/iot/hid")
    @SendTo("/topic/hid")
    public Map<String, String>  hid(Map<String, String> payload) {
        try{
            String terminalId = payload.get("terminal_id");
            String peopleCountView = payload.get("people_count");
            int peopleCount = Integer.parseInt(payload.get("people_count"));
            int statPeopleCount = Integer.parseInt(payload.get("stat_people_count"));
            String fileName = payload.get("file_name");
            // HID 로그 저장
            hidLogService.insertHidLog(terminalId, peopleCount,statPeopleCount, fileName);
            Map<String, String> response = new HashMap<>();
            response.put("terminal_id", terminalId);
            response.put("people_count", peopleCountView);

            return response;
        } catch (Exception e){
            log.error("WebSocket 메시지 처리 중 오류 발생: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            return response;
        }
    }
    @MessageMapping("/iot/config")
    @SendTo("/topic/config")
    public Map<String, String>  config(Map<String, String> payload) {

        try{
            List<SettingDTO> settingDTOList = settingService.getSetting();
            // 최근 기온 데이터 추가
            String t1h = weatherService.getRecentWeatherData()
                    .stream()
                    .findFirst()
                    .map(weather -> String.valueOf(weather.getT1H()))
                    .orElse("");


            Map<String, String> response = new HashMap<>();
            response.put("t1h", t1h);
            for (SettingDTO dto : settingDTOList) {
                Long idLong = dto.getId();
                if (idLong == null) continue;

                int id = idLong.intValue(); // Long → int 변환
                String optionKey = dto.getOptionKey(); // 'option1' or 'option2'
                String value = dto.getValue();

                switch (id) {
                    case 1:
                        if ("option1".equals(optionKey)) {
                            response.put("ledLiteOnTime", value);  // 켜지는 시간
                        } else if ("option2".equals(optionKey)) {
                            response.put("ledLiteOffTime", value); // 꺼지는 시간
                        }
                        break;
                    case 2:
                        response.put("fanTemperature", value); // FAN 작동 온도
                        break;
                    case 3:
                        if ("option1".equals(optionKey)) {
                            response.put("ledMessage", value);  // 승차대기 문구
                        } else if ("option2".equals(optionKey)) {
                            response.put("ledFontColor", value); // 글자색상
                        }
                        break;
                    case 4:
                        response.put("allowIpList", value); // 허용 IP
                        break;
                }
            }

            return response;
        } catch (Exception e){
            log.error("WebSocket 메시지 처리 중 오류 발생: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            return response;
        }
    }
    @MessageMapping("/iot/command")
    @SendTo("/topic/command")
    public Map<String, String> sendShellCommand(Map<String, String> payload) {
        String command = payload.get("command");
        String terminalId = payload.get("terminalId"); // 선택적으로 특정 보드에만 전송

        Map<String, String> response = new HashMap<>();
        response.put("command", command);
        response.put("terminalId", terminalId != null ? terminalId : "ALL");
        response.put("message", "Shell command pushed to terminal(s).");

        return response;
    }

    @MessageMapping("/iot/command/result")
    @SendTo("/topic/command/result")
    public Map<String, String> receiveCommandResult(Map<String, String> payload) {
        return payload; // 브라우저로 전송됨
    }
}

