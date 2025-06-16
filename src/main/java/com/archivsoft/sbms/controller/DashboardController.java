package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.DashboardService;
import com.archivsoft.sbms.service.MenuService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("dashboard")
public class DashboardController {
    private final MenuService menuService;
    private final DashboardService dashboardService;

    public DashboardController(MenuService menuService, DashboardService dashboardService) {
        this.menuService = menuService;
        this.dashboardService = dashboardService;
    }

    @GetMapping({"", "dashboard1"})
    public String dashboard(Model model) {
        model.addAttribute("page", "dashboard1");
        return "dashboard/dashboard";
    }

    @GetMapping("dashboard2")
    public String dashboard2(Model model) {
        model.addAttribute("page", "dashboard2");
        return "dashboard/dashboard";
    }
}
