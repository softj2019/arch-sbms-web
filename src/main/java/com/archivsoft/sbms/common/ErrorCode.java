package com.archivsoft.sbms.common;

public enum ErrorCode {
    INTERNAL_ERROR("서버 내부 오류입니다.");
    private final String message;
    ErrorCode(String message) { this.message = message; }
    public String getMessage() { return message; }
}
