package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.WeatherAirQualityStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/system")
public class WeatherAirQualityStatusController {

    @Autowired
    private WeatherAirQualityStatusService statusService;

    @GetMapping("/weather-status")
    public String weatherStatus(Model model) {
        //statusService.getAllWeatherStatuses();
        return "system/weatherStatus";
    }
}
