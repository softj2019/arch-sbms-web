package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.SystemUserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("systemctl")
public class SystemUserController {

    private final SystemUserService systemUserService;

    public SystemUserController(SystemUserService systemUserService) {
        this.systemUserService = systemUserService;
    }

    @GetMapping({"", "usermng"})
    public String user(Model model) {
        return "systemctl/usermng";
    }

    @GetMapping("cnncHist")
    public String cnncHist(Model model) {
        return "systemctl/cnncHist";
    }

    @GetMapping("cnncStat")
    public String cnncStat(Model model) {
        return "systemctl/cnncStat";
    }

}
