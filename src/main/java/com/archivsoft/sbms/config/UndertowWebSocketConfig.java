package com.archivsoft.sbms.config;

import io.undertow.UndertowOptions;
import org.springframework.boot.web.embedded.undertow.UndertowServletWebServerFactory;
import org.springframework.boot.web.embedded.undertow.UndertowWebServer;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class UndertowWebSocketConfig {
    @Bean
    public WebServerFactoryCustomizer<UndertowServletWebServerFactory> undertowWebSocketCustomizer() {
        return factory -> factory.addBuilderCustomizers(builder -> {
            builder.setServerOption(UndertowOptions.ENABLE_HTTP2, true); // HTTP/2 설정 (선택사항)
        });
    }
}
