package com.archivsoft.sbms.controller.api;
import com.archivsoft.sbms.config.UploadPathProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload/image")
public class UploadRestController {
    @Autowired
    private UploadPathProvider uploadPathProvider;

    @PostMapping
    public  ResponseEntity<Map<String, String>>  uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("file_name") String file_name) {

        Map<String, String> response = new HashMap<>();

        if (file.isEmpty()) {
            response.put("status", "error");
            response.put("message", "파일이 없습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            File saveFile = Paths.get(uploadPathProvider.getUploadDir() + file_name).toFile();
            file.transferTo(saveFile);

            String fileUrl = "/uploads/" + file_name;
            response.put("status", "success");
            response.put("file_url", fileUrl);
            response.put("message", "이미지 업로드 성공!");
            return ResponseEntity.ok().body(response);
        } catch (IOException e) {
            response.put("status", "error");
            response.put("message", "파일 저장 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/getImg")
    public ResponseEntity<Resource> getImage(@RequestParam String filename) {
        try {
            Path filePath = Paths.get(uploadPathProvider.getUploadDir()).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, "image/jpeg");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
