package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.model.WeatherAirQuality;
import com.archivsoft.sbms.service.MenuService;
import com.archivsoft.sbms.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("weather")
public class WeatherController {
    private final MenuService menuService;
    @Autowired
    private WeatherService weatherService;
    public WeatherController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping({"", "/"})
    public String weather(Model model) {
        List<WeatherAirQuality> weatherAirQualities = weatherService.getRecentWeatherData();

        if (!weatherAirQualities.isEmpty()) {
            WeatherAirQuality currentStatus = weatherAirQualities.get(0);
            model.addAttribute("weatherAirQuality", currentStatus);
        }
        return "common/weather";
    }

}
