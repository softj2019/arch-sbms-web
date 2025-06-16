package com.archivsoft.sbms.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
@Component
public class UploadPathProvider {
    @Value("${upload.path}")
    private String uploadDir;

    public String getUploadDir() {
        return uploadDir;
    }
}
