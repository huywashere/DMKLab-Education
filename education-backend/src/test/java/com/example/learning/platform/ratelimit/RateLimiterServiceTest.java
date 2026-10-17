package com.example.learning.platform.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Test: RateLimiterService (Kiểm thử Giới hạn Tần suất & Fallback)")
class RateLimiterServiceTest {

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
    }

    @Test
    @DisplayName("Request trong hạn mức cho phép phải có allowed = true")
    void shouldAllowRequestsWithinLimit() {
        RateLimitPolicy policy = RateLimitPolicy.AUTH_LOGIN; // Max 5 reqs
        String clientIp = "192.168.1.100";

        for (int i = 1; i <= policy.getMaxRequests(); i++) {
            RateLimitResult result = rateLimiterService.checkRateLimit(policy, clientIp);
            assertTrue(result.isAllowed(), "Request #" + i + " phải được chấp nhận");
            assertEquals(i, result.getCurrentCount());
            assertEquals(policy.getMaxRequests() - i, result.getRemainingRequests());
        }
    }

    @Test
    @DisplayName("Request vượt quá hạn mức tối đa phải bị chặn (allowed = false)")
    void shouldBlockRequestsExceedingLimit() {
        RateLimitPolicy policy = RateLimitPolicy.AUTH_REGISTER; // Max 3 reqs
        String clientIp = "10.0.0.1";

        // Gửi 3 request hợp lệ
        for (int i = 0; i < policy.getMaxRequests(); i++) {
            rateLimiterService.checkRateLimit(policy, clientIp);
        }

        // Request thứ 4 phải bị chặn ngay lập tức
        RateLimitResult blockedResult = rateLimiterService.checkRateLimit(policy, clientIp);
        assertFalse(blockedResult.isAllowed(), "Request thứ 4 phải bị từ chối");
        assertEquals(4, blockedResult.getCurrentCount());
        assertEquals(0, blockedResult.getRemainingRequests());
        assertTrue(blockedResult.getRetryAfterSeconds() > 0);
    }

    @Test
    @DisplayName("Admin mở khóa thủ công một key phải xóa lệnh chặn")
    void shouldUnblockKeySuccessfully() {
        RateLimitPolicy policy = RateLimitPolicy.AUTH_LOGIN;
        String clientIp = "192.168.1.200";

        // Gửi quá tải 6 requests
        for (int i = 0; i < 6; i++) {
            rateLimiterService.checkRateLimit(policy, clientIp);
        }

        RateLimitResult blockedResult = rateLimiterService.checkRateLimit(policy, clientIp);
        assertFalse(blockedResult.isAllowed());

        // Admin mở khóa
        String fullKey = policy.name() + ":" + clientIp;
        boolean unblocked = rateLimiterService.unblockKey(fullKey);
        assertTrue(unblocked);

        // Request kế tiếp phải được tính lại từ đầu
        RateLimitResult freshResult = rateLimiterService.checkRateLimit(policy, clientIp);
        assertTrue(freshResult.isAllowed());
        assertEquals(1, freshResult.getCurrentCount());
    }

    @Test
    @DisplayName("Kiểm tra thống kê hệ thống RateLimitStats")
    void shouldReturnAccurateStats() {
        RateLimitPolicy policy = RateLimitPolicy.AI_CHAT;
        String client = "student_test";

        rateLimiterService.checkRateLimit(policy, client);

        RateLimiterService.RateLimitStats stats = rateLimiterService.getStats();
        assertNotNull(stats);
        assertTrue(stats.getTotalChecked() >= 1);
        assertNotNull(stats.getStorageType());
    }
}
