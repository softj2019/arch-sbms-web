package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.MenuService;
import com.archivsoft.sbms.service.SystemService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("system")
public class SystemController {
    private final MenuService menuService;
    private final SystemService systemService;

    public SystemController(MenuService menuService, SystemService systemService) {
        this.menuService = menuService;
        this.systemService = systemService;
    }

    @GetMapping({"", "user"})
    public String user(Model model) {
        return "system/user";
    }

    @GetMapping("grant")
    public String grant(Model model) {
        return "system/grant";
    }

    @GetMapping("schedule")
    public String schedule(Model model) {
        return "system/schedule";
    }

}



