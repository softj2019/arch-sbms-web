package com.archivsoft.sbms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("control")
public class ControlController {
    @GetMapping({"","screen"})
    public String screen(Model model) {return "control/screen";}

    @GetMapping("message")
    public String Message(Model model) {
        return "control/message";
    }

    @GetMapping("controlLog")
    public String log(Model model) {
        return "control/controlLog";
    }

    @GetMapping("setting")
    public String setting(Model model) {
        return "control/setting";
    }

    @GetMapping("allowedIp")
    public String allowedIp(Model model) { return "control/allowedIp";}
}
