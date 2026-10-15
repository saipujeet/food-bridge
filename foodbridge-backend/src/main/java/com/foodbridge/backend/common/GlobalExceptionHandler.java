package com.foodbridge.backend.common;

import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.security.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        String corrId = getCorrelationId();
        log.warn("Access denied for URI: {} [corrId={}]: {}", request.getRequestURI(), corrId, ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("FORBIDDEN: " + ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        String corrId = getCorrelationId();
        log.warn("Authentication failed for URI: {} [corrId={}]: {}", request.getRequestURI(), corrId, ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("UNAUTHORIZED: Authentication is required to access this resource."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        String corrId = getCorrelationId();
        log.info("Invalid client request for URI: {} [corrId={}]: {}", request.getRequestURI(), corrId, ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String corrId = getCorrelationId();
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        log.info("Validation error for URI: {} [corrId={}]: {}", request.getRequestURI(), corrId, message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        String corrId = getCorrelationId();
        log.warn("Method not allowed: {} on URI: {} [corrId={}]", request.getMethod(), request.getRequestURI(), corrId);
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error("Method " + request.getMethod() + " is not permitted on this resource. History and audit records are immutable."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex, HttpServletRequest request) {
        String corrId = getCorrelationId();
        // Log detailed exception stack trace to server logs only, NEVER leak to client
        log.error("Unhandled server exception for URI: {} [corrId={}]", request.getRequestURI(), corrId, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An internal error occurred. Please reference tracking ID: " + corrId));
    }

    private String getCorrelationId() {
        String corrId = MDC.get(CorrelationIdFilter.MDC_KEY);
        return (corrId != null && !corrId.isEmpty()) ? corrId : "N/A";
    }
}
