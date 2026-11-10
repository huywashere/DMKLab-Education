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
    private final com.example.learning.platform.security.JwtTokenProvider jwtTokenProvider;
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

        // Định danh đối tượng Rate Limit:
        // - Với người dùng đã đăng nhập: Phân biệt theo "user:{userId}" để tránh nghẽn khi cả phòng máy trường học dùng chung 1 địa chỉ IP NAT
        // - Với endpoint công khai / chưa đăng nhập (Auth login, register, contact): Phân biệt theo "ip:{clientIp}"
        String clientIdentifier = "ip:" + clientIp;
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtTokenProvider.validateToken(token)) {
                    java.util.UUID userId = jwtTokenProvider.getUserIdFromToken(token);
                    clientIdentifier = "user:" + userId;
                }
            } catch (Exception ignored) {}
        }

        RateLimitResult result = rateLimiterService.checkRateLimit(policy, clientIdentifier);

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
        if (uri.startsWith("/api/v1/auth/forgot-password") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPolicy.AUTH_LOGIN;
        }
        if (uri.startsWith("/api/v1/notifications/email/") && "POST".equalsIgnoreCase(method)) {
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
        if (uri.contains("/media/upload-url") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPolicy.MEDIA_UPLOAD;
        }
        if (uri.contains("/search")) {
            return RateLimitPolicy.SEARCH_QUERY;
        }
        if (uri.startsWith("/api/v1/admin/")) {
            return RateLimitPolicy.ADMIN_OPERATIONS;
        }

        return RateLimitPolicy.DEFAULT_GLOBAL;
    }

    private static final java.util.regex.Pattern IP_PATTERN =
            java.util.regex.Pattern.compile("^[0-9a-fA-F.:]{3,45}$");

    /**
     * Trích xuất địa chỉ IP thực tế của client kể cả khi đứng sau Proxy / CDN (Cloudflare, Nginx).
     * Ưu tiên header tin cậy từ Edge Gateway (CF-Connecting-IP, X-Real-IP) trước khi đọc X-Forwarded-For
     * và lọc định dạng regex để ngăn chặn Header Injection / Spoofing.
     */
    private String extractClientIp(HttpServletRequest request) {
        // 1. Cloudflare Edge Proxy Header (Được ký và tiêm từ Cloudflare Gateway, client không thể giả mạo)
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (StringUtils.hasText(cfConnectingIp) && IP_PATTERN.matcher(cfConnectingIp.trim()).matches()) {
            return cfConnectingIp.trim();
        }

        // 2. Nginx / Ingress Reverse Proxy IP
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp) && IP_PATTERN.matcher(xRealIp.trim()).matches()) {
            return xRealIp.trim();
        }

        // 3. X-Forwarded-For (lấy client IP đầu tiên trong chuỗi hop và sanitize)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            String firstIp = xForwardedFor.split(",")[0].trim();
            if (IP_PATTERN.matcher(firstIp).matches()) {
                return firstIp;
            }
        }

        // 4. Fallback TCP Remote Address
        String remoteAddr = request.getRemoteAddr();
        if (StringUtils.hasText(remoteAddr) && IP_PATTERN.matcher(remoteAddr.trim()).matches()) {
            return remoteAddr.trim();
        }

        return "127.0.0.1";
    }
}
