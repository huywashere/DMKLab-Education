package com.example.learning.platform.ratelimit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class RateLimiterService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Autowired(required = false)
    @SuppressWarnings("rawtypes")
    private RedisScript<List> rateLimitRedisScript;

    // Bộ nhớ dự phòng RAM (In-Memory Fallback) khi Redis không kết nối được
    private final Map<String, WindowBucket> buckets = new ConcurrentHashMap<>();
    private final AtomicLong totalChecked = new AtomicLong(0);
    private final AtomicLong totalThrottled = new AtomicLong(0);
    private final AtomicLong lastRedisWarningEpoch = new AtomicLong(0);

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class WindowBucket {
        private AtomicInteger counter;
        private long windowStartEpoch;
        private long windowSeconds;
        private int maxRequests;

        public long getResetEpoch() {
            return windowStartEpoch + windowSeconds;
        }
    }

    /**
     * Kiểm tra và áp dụng Rate Limit theo chính sách được cấu hình.
     * Sử dụng Redis Atomic Sliding Window Counter, tự động chuyển sang In-Memory Fallback nếu Redis ngoại tuyến.
     */
    public RateLimitResult checkRateLimit(RateLimitPolicy policy, String clientIdentifier) {
        totalChecked.incrementAndGet();
        String keySuffix = (clientIdentifier != null && !clientIdentifier.isBlank()) ? clientIdentifier : "unknown";
        String fullKey = policy.name() + ":" + keySuffix;
        String redisKey = "ratelimit:" + fullKey;

        // 1. Cố gắng sử dụng Redis phân tán
        if (redisTemplate != null && rateLimitRedisScript != null) {
            try {
                @SuppressWarnings("unchecked")
                List<?> result = redisTemplate.execute(
                        rateLimitRedisScript,
                        Collections.singletonList(redisKey),
                        String.valueOf(policy.getMaxRequests()),
                        String.valueOf(policy.getWindowSeconds())
                );

                if (result != null && result.size() >= 2) {
                    int currentCount = ((Number) result.get(0)).intValue();
                    long ttl = ((Number) result.get(1)).longValue();
                    long now = Instant.now().getEpochSecond();
                    long resetEpoch = now + Math.max(1, ttl);
                    long retryAfter = Math.max(1, ttl);
                    long remaining = Math.max(0, policy.getMaxRequests() - currentCount);
                    boolean allowed = currentCount <= policy.getMaxRequests();

                    if (!allowed) {
                        totalThrottled.incrementAndGet();
                        log.warn("[REDIS_RATE_LIMIT_BLOCKED] Key: {}, Chính sách: {}, Số lần: {}/{}, Thử lại sau: {}s",
                                redisKey, policy.name(), currentCount, policy.getMaxRequests(), retryAfter);
                    }

                    return RateLimitResult.builder()
                            .allowed(allowed)
                            .currentCount(currentCount)
                            .maxRequests(policy.getMaxRequests())
                            .remainingRequests(remaining)
                            .retryAfterSeconds(retryAfter)
                            .resetEpochSeconds(resetEpoch)
                            .policyName(policy.name())
                            .key(fullKey)
                            .build();
                }
            } catch (Exception ex) {
                logRedisFallbackOnce(ex);
            }
        }

        // 2. Dự phòng In-Memory Token Bucket trong RAM nếu Redis không khả dụng
        return checkInMemoryRateLimit(policy, fullKey);
    }

    private RateLimitResult checkInMemoryRateLimit(RateLimitPolicy policy, String fullKey) {
        long now = Instant.now().getEpochSecond();

        WindowBucket bucket = buckets.compute(fullKey, (k, existing) -> {
            if (existing == null || now >= existing.getResetEpoch()) {
                return new WindowBucket(new AtomicInteger(1), now, policy.getWindowSeconds(), policy.getMaxRequests());
            } else {
                existing.getCounter().incrementAndGet();
                return existing;
            }
        });

        int currentCount = bucket.getCounter().get();
        boolean allowed = currentCount <= policy.getMaxRequests();
        long resetEpoch = bucket.getResetEpoch();
        long retryAfter = Math.max(1, resetEpoch - now);
        long remaining = Math.max(0, policy.getMaxRequests() - currentCount);

        if (!allowed) {
            totalThrottled.incrementAndGet();
            log.warn("[MEMORY_RATE_LIMIT_BLOCKED] Key: {}, Chính sách: {}, Số lần: {}/{}, Thử lại sau: {}s",
                    fullKey, policy.name(), currentCount, policy.getMaxRequests(), retryAfter);
        }

        return RateLimitResult.builder()
                .allowed(allowed)
                .currentCount(currentCount)
                .maxRequests(policy.getMaxRequests())
                .remainingRequests(remaining)
                .retryAfterSeconds(retryAfter)
                .resetEpochSeconds(resetEpoch)
                .policyName(policy.name())
                .key(fullKey)
                .build();
    }

    private void logRedisFallbackOnce(Exception ex) {
        long now = Instant.now().getEpochSecond();
        long last = lastRedisWarningEpoch.get();
        if (now - last > 60) {
            if (lastRedisWarningEpoch.compareAndSet(last, now)) {
                log.warn("[RATE_LIMITER] Redis ngoại tuyến ({}), tự động chuyển sang chế độ RAM In-Memory fallback an toàn.", ex.getMessage());
            }
        }
    }

    /**
     * Thống kê hệ thống Rate Limiting thời gian thực
     */
    public RateLimitStats getStats() {
        long now = Instant.now().getEpochSecond();
        List<BlockedKeyDetail> activeBlocked = new ArrayList<>();

        boolean isRedisConnected = false;
        if (redisTemplate != null) {
            try {
                if (redisTemplate.getConnectionFactory() != null) {
                    var conn = redisTemplate.getConnectionFactory().getConnection();
                    conn.ping();
                    conn.close();
                    isRedisConnected = true;
                }
            } catch (Exception ignored) {
                isRedisConnected = false;
            }
        }

        // Lấy danh sách block từ in-memory fallback
        buckets.forEach((k, b) -> {
            if (now < b.getResetEpoch() && b.getCounter().get() > b.getMaxRequests()) {
                activeBlocked.add(new BlockedKeyDetail(
                        k,
                        b.getCounter().get(),
                        b.getMaxRequests(),
                        b.getResetEpoch() - now
                ));
            }
        });

        return RateLimitStats.builder()
                .totalChecked(totalChecked.get())
                .totalThrottled(totalThrottled.get())
                .currentlyTrackedBuckets(buckets.size())
                .activeBlockedCount(activeBlocked.size())
                .activeBlockedDetails(activeBlocked)
                .redisConnected(isRedisConnected)
                .storageType(isRedisConnected ? "REDIS_DISTRIBUTED" : "IN_MEMORY_FALLBACK")
                .build();
    }

    /**
     * Mở khóa thủ công cho một IP / Key bởi Quản trị viên (xóa trên cả Redis và In-Memory)
     */
    public boolean unblockKey(String key) {
        boolean redisSuccess = false;
        if (redisTemplate != null) {
            try {
                String redisKey = key.startsWith("ratelimit:") ? key : "ratelimit:" + key;
                Boolean deleted = redisTemplate.delete(redisKey);
                redisSuccess = Boolean.TRUE.equals(deleted);
            } catch (Exception ex) {
                log.debug("Lỗi unblock key trên Redis: {}", ex.getMessage());
            }
        }
        boolean memSuccess = buckets.remove(key) != null;
        return redisSuccess || memSuccess;
    }

    /**
     * Tự động dọn dẹp các bucket đã hết hạn mỗi 5 phút để bảo vệ bộ nhớ RAM
     */
    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredBuckets() {
        long now = Instant.now().getEpochSecond();
        buckets.entrySet().removeIf(entry -> now >= entry.getValue().getResetEpoch());
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RateLimitStats {
        private long totalChecked;
        private long totalThrottled;
        private int currentlyTrackedBuckets;
        private int activeBlockedCount;
        private List<BlockedKeyDetail> activeBlockedDetails;
        private boolean redisConnected;
        private String storageType;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BlockedKeyDetail {
        private String key;
        private int attempts;
        private int limit;
        private long remainingSeconds;
    }
}
