package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.FacilityService;
import com.archivsoft.sbms.service.MenuService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("facility")
public class FacilityController {
    private final MenuService menuService;
    private final FacilityService facilityService;

    public FacilityController(MenuService menuService, FacilityService facilityService) {
        this.menuService = menuService;
        this.facilityService = facilityService;
    }

    @GetMapping("")
    public String facility(Model model) {
        return "facility/facility";
    }
}