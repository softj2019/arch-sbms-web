package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.InformationService;
import com.archivsoft.sbms.service.MenuService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("information")
public class InformationController {
    private final MenuService menuService;
    private final InformationService informationService;

    public InformationController(MenuService menuService, InformationService informationService) {
        this.menuService = menuService;
        this.informationService = informationService;
    }

    @GetMapping({"", "onsite"})
    public String onsite(Model model) {
        return "information/onsite";
    }

    @GetMapping("link")
    public String link(Model model) {
        return "redirect:/system/weather-status";
    }
}
