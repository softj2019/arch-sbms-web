package com.archivsoft.sbms;

import com.archivsoft.sbms.util.UdpListenerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import java.util.List;


@Slf4j
@SpringBootApplication
@EnableCaching          // App Level에서 DB 캐싱을 위한 설정
public class Application implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("ARCH SBMS START");
    }
}
