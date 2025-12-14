package com.archivsoft.sbms.config;

import com.archivsoft.sbms.exception.CustomException;
import com.archivsoft.sbms.exception.CustomJwtException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Collections;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomJwtException.class)
    public ResponseEntity<?> handleCustomJwtException(CustomJwtException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(Collections.singletonMap("message", ex.getMessage()));
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<?> handleCustomException(CustomException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(Collections.singletonMap("message", ex.getMessage()));
    }
}
