package com.archivsoft.sbms.config;
import com.archivsoft.sbms.entity.Rmmenu;
import com.archivsoft.sbms.service.CommonService;
import com.archivsoft.sbms.service.MenuService;
import egovframework.com.cmm.EgovMessageSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import java.util.List;
import java.util.Map;

@ControllerAdvice
public class GlobalControllerAdvice {
    @Autowired
    private MenuService menuService;
    @Autowired
    private EgovMessageSource messageSource;
    @Autowired
    private CommonService commonService;

    @ModelAttribute("menuSeq")
    public List<Rmmenu> list() {
        Map<String, Object> userDetails = commonService.extractUserDetails();
        return menuService.list(userDetails);
    }

    @ModelAttribute("globalMessage")
    public String getGlobalMessage(String code) {
        try {
            return messageSource.getMessage(code);
        } catch (Exception e) {
            return "No message available for code: " + code;
        }
    }

    @ModelAttribute("userDetails")
    public Map<String, Object>  getUserInfo() {
        return commonService.extractUserDetails();
    }

    // URL 접근가능여부 검증
}