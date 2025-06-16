package com.archivsoft.sbms.exception;

import org.springframework.http.HttpStatus;

public class CustomJwtException extends RuntimeException {
    private final HttpStatus status;
    private final String message;
    public CustomJwtException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.message = message;
        this.status = status;
    }

    public CustomJwtException(String message, HttpStatus status) {
        super(message);
        this.message = message;
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
