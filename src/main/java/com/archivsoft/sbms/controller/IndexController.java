package com.archivsoft.sbms.controller;

import com.archivsoft.sbms.service.MenuService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class IndexController {
    private final MenuService menuService;

    public IndexController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping({"", "/","index"})
    public String index(Model model) {
        return "redirect:/dashboard";
    }
    @RequestMapping(value = "login", method = {RequestMethod.GET, RequestMethod.POST})
    public String login(Model model) {
        return "common/login";
    }
    @GetMapping("denied")
    public String denied() {
        return "common/denied";
    }
}
