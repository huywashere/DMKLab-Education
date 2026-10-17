package com.example.learning.platform.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class JwtBlacklistService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // Danh sách các JWT cụ thể đã đăng xuất: Token -> Expiration Epoch Seconds (In-Memory Fallback)
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

    // Thời điểm thu hồi tất cả phiên của một User: UserId -> Revocation Epoch Seconds (In-Memory Fallback)
    private final Map<UUID, Long> userRevocationTimestamps = new ConcurrentHashMap<>();

    private static final String REDIS_JWT_PREFIX = "jwt:blacklist:";
    private static final String REDIS_USER_REVOKE_PREFIX = "jwt:revoke:user:";

    /**
     * Đưa một Token vào danh sách đen khi người dùng bấm Đăng Xuất (Logout).
     * Lưu vào Redis phân tán kèm TTL chính xác, và đồng bộ fallback vào RAM.
     */
    public void blacklistToken(String token, long expirationEpochSeconds) {
        if (token == null || token.isBlank()) return;

        long now = Instant.now().getEpochSecond();
        long ttlSeconds = Math.max(1, expirationEpochSeconds - now);

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(
                        REDIS_JWT_PREFIX + token,
                        "revoked",
                        Duration.ofSeconds(ttlSeconds)
                );
                log.info("[JWT_BLACKLIST_REDIS] Đã thu hồi token trên Redis (TTL {}s)", ttlSeconds);
            } catch (Exception ex) {
                log.warn("[JWT_BLACKLIST] Không thể lưu vào Redis, lưu dự phòng RAM: {}", ex.getMessage());
            }
        }

        blacklistedTokens.put(token, expirationEpochSeconds);
        log.info("[JWT_BLACKLIST] Đã thu hồi token (hết hạn vào epoch {})", expirationEpochSeconds);
    }

    /**
     * Thu hồi tất cả phiên làm việc đang hoạt động của một User ID
     */
    public void revokeAllSessionsForUser(UUID userId) {
        if (userId == null) return;
        long now = Instant.now().getEpochSecond();

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(
                        REDIS_USER_REVOKE_PREFIX + userId,
                        String.valueOf(now),
                        Duration.ofDays(30)
                );
                log.warn("[USER_SESSIONS_REVOKED_REDIS] Toàn bộ phiên của người dùng {} đã bị thu hồi trên Redis", userId);
            } catch (Exception ex) {
                log.warn("[USER_SESSIONS_REVOKED] Không thể lưu vào Redis, lưu dự phòng RAM: {}", ex.getMessage());
            }
        }

        userRevocationTimestamps.put(userId, now);
        log.warn("[USER_SESSIONS_REVOKED] Toàn bộ phiên của người dùng {} đã bị thu hồi lúc epoch {}", userId, now);
    }

    /**
     * Kiểm tra xem Token có nằm trong danh sách đen hoặc được cấp trước thời điểm thu hồi phiên không
     */
    public boolean isTokenRevoked(String token, UUID userId, Long tokenIssuedAtEpoch) {
        if (token == null) return false;

        // 1. Kiểm tra trên Redis phân tán trước
        if (redisTemplate != null) {
            try {
                Boolean hasKey = redisTemplate.hasKey(REDIS_JWT_PREFIX + token);
                if (Boolean.TRUE.equals(hasKey)) {
                    return true;
                }

                if (userId != null && tokenIssuedAtEpoch != null) {
                    String revokeEpochStr = redisTemplate.opsForValue().get(REDIS_USER_REVOKE_PREFIX + userId);
                    if (revokeEpochStr != null) {
                        long revokeEpoch = Long.parseLong(revokeEpochStr);
                        if (tokenIssuedAtEpoch < revokeEpoch) {
                            return true;
                        }
                    }
                }
            } catch (Exception ex) {
                log.debug("[JWT_BLACKLIST] Không kết nối được Redis, chuyển sang kiểm tra RAM: {}", ex.getMessage());
            }
        }

        // 2. Fallback kiểm tra RAM (In-Memory)
        Long expiry = blacklistedTokens.get(token);
        if (expiry != null) {
            long now = Instant.now().getEpochSecond();
            if (now < expiry) {
                return true;
            } else {
                blacklistedTokens.remove(token);
            }
        }

        // Kiểm tra nếu tài khoản bị Admin hoặc chính người dùng bấm "Thu hồi tất cả phiên"
        if (userId != null && tokenIssuedAtEpoch != null) {
            Long userRevokeTime = userRevocationTimestamps.get(userId);
            if (userRevokeTime != null && tokenIssuedAtEpoch < userRevokeTime) {
                return true;
            }
        }

        return false;
    }

    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }

    /**
     * Tự động dọn dẹp các token đã hết hạn tự nhiên trong RAM để giải phóng bộ nhớ
     */
    @Scheduled(fixedRate = 900000) // 15 phút
    public void cleanupExpiredTokens() {
        long now = Instant.now().getEpochSecond();
        blacklistedTokens.entrySet().removeIf(entry -> now >= entry.getValue());
    }
}
