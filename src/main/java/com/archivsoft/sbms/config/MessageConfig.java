package com.archivsoft.sbms.config;

import egovframework.com.cmm.EgovMessageSource;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

@Configuration
public class MessageConfig {
    @Bean
    public EgovMessageSource egovMessageSource(MessageSource messageSource) {
        ReloadableResourceBundleMessageSource bundleMessageSource = new ReloadableResourceBundleMessageSource();
        bundleMessageSource.setParentMessageSource(messageSource);
        bundleMessageSource.setCacheSeconds(60);

        EgovMessageSource egovMessageSource = new EgovMessageSource();
        egovMessageSource.setReloadableResourceBundleMessageSource(bundleMessageSource);

        return egovMessageSource;
    }
}