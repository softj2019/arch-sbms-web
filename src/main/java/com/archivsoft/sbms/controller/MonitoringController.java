package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.MenuService;
import com.archivsoft.sbms.service.MonitoringService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("monitoring")
public class MonitoringController {

    public MonitoringController(MenuService menuService, MonitoringService monitoringService) {
    }

    @GetMapping("system")
    public String monitoring(Model model) {
        return "monitoring/monitoring";
    }
    @GetMapping("wifi")
    public String wifi(Model model) {
        return "monitoring/wifi";
    }
    @GetMapping("hid")
    public String hid(Model model) {
        return "monitoring/hidLog";
    }
    @GetMapping("command")
    public String command(Model model) {
        return "monitoring/command";
    }
}