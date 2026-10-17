package com.example.learning.platform.ratelimit;

import com.example.learning.audit.service.AuditService;
import com.example.learning.platform.api.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final AuditService auditService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        // Bỏ qua các endpoint tài liệu Swagger, OpenAPI và Actuator health check
        if (uri.startsWith("/swagger-ui") || uri.startsWith("/v3/api-docs") || uri.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bỏ qua preflight OPTIONS requests của CORS
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        RateLimitPolicy policy = resolvePolicy(uri, method);

        RateLimitResult result = rateLimiterService.checkRateLimit(policy, clientIp);

        // Gắn các HTTP Header tiêu chuẩn RFC 6585 & IETF RateLimit
        response.setHeader("X-RateLimit-Limit", String.valueOf(result.getMaxRequests()));
        response.setHeader("X-RateLimit-Policy", policy.name());
        response.setHeader("X-RateLimit-Reset", String.valueOf(result.getResetEpochSeconds()));

        if (!result.isAllowed()) {
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // HTTP 429
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            // Ghi nhật ký kiểm toán hành vi spam / flood
            try {
                auditService.logAction(
                        null,
                        "RATE_LIMIT_BLOCKED",
                        "SECURITY",
                        policy.name(),
                        String.format("Đã chặn request quá tần suất [%s %s]. Số lần vi phạm: %d/%d. Thử lại sau: %ds",
                                method, uri, result.getCurrentCount(), result.getMaxRequests(), result.getRetryAfterSeconds()),
                        clientIp
                );
            } catch (Exception e) {
                log.warn("Không thể ghi log kiểm toán RateLimit: {}", e.getMessage());
            }

            String errorMessage = String.format(
                    "Bạn đang gửi yêu cầu quá nhanh đến chức năng [%s]. Hệ thống bảo vệ DMKLab đã kích hoạt giới hạn tốc độ (HTTP 429 Too Many Requests). Vui lòng thử lại sau %d giây.",
                    policy.getDescription(),
                    result.getRetryAfterSeconds()
            );

            ApiResponse<?> errorResponse = ApiResponse.error(errorMessage);
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return;
        }

        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemainingRequests()));
        filterChain.doFilter(request, response);
    }

    /**
     * Ánh xạ URI và Method sang chính sách RateLimit cụ thể
     */
    private RateLimitPolicy resolvePolicy(String uri, String method) {
        if (uri.startsWith("/api/v1/auth/login") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPolicy.AUTH_LOGIN;
        }
        if (uri.startsWith("/api/v1/auth/register") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPolicy.AUTH_REGISTER;
        }
        if (uri.startsWith("/api/v1/auth/change-password") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPolicy.AUTH_PASSWORD_CHANGE;
        }
        if (uri.startsWith("/api/v1/ai/")) {
            return RateLimitPolicy.AI_CHAT;
        }
        if (uri.contains("/quiz/submit") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPolicy.ASSESSMENT_SUBMIT;
        }
        if (uri.startsWith("/api/v1/progress/")) {
            return RateLimitPolicy.PROGRESS_HEARTBEAT;
        }
        if (uri.startsWith("/api/v1/public/contact") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPolicy.PUBLIC_CONTACT;
        }
        if (uri.startsWith("/api/v1/admin/")) {
            return RateLimitPolicy.ADMIN_OPERATIONS;
        }

        return RateLimitPolicy.DEFAULT_GLOBAL;
    }

    /**
     * Trích xuất địa chỉ IP thực tế của client kể cả khi đứng sau Proxy / CDN (Cloudflare, Nginx)
     */
    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (StringUtils.hasText(cfConnectingIp)) {
            return cfConnectingIp.trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
