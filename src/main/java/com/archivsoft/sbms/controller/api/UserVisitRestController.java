package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.service.SystemUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system/user")
public class UserVisitRestController {

    @Autowired
    private SystemUserService systemUserService;

    @GetMapping("/visit-stats")
    public Map<String, Integer> getVisitStats() {
        Map<String, Integer> result = new HashMap<>();
        result.put("today", systemUserService.getTodayVisit());
        result.put("week", systemUserService.getWeekVisit());
        result.put("month", systemUserService.getMonthVisit());
        return result;
    }
}
