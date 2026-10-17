package com.example.learning.platform.ratelimit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Slf4j
public class RateLimiterService {

    private final Map<String, WindowBucket> buckets = new ConcurrentHashMap<>();
    private final AtomicLong totalChecked = new AtomicLong(0);
    private final AtomicLong totalThrottled = new AtomicLong(0);

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
     * Kiểm tra và áp dụng Rate Limit theo chính sách được cấu hình
     */
    public RateLimitResult checkRateLimit(RateLimitPolicy policy, String clientIdentifier) {
        totalChecked.incrementAndGet();
        String fullKey = policy.name() + ":" + (clientIdentifier != null ? clientIdentifier : "unknown");
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
            log.warn("[RATE_LIMIT_BLOCKED] Key: {}, Chính sách: {}, Số lần: {}/{}, Thử lại sau: {}s",
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

    /**
     * Thống kê hệ thống Rate Limiting
     */
    public RateLimitStats getStats() {
        long now = Instant.now().getEpochSecond();
        List<BlockedKeyDetail> activeBlocked = new ArrayList<>();

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
                .build();
    }

    /**
     * Mở khóa thủ công cho một IP / Key bởi Quản trị viên
     */
    public boolean unblockKey(String key) {
        return buckets.remove(key) != null;
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
