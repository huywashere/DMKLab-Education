package com.example.learning.platform.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class JwtBlacklistService {

    // Danh sách các JWT cụ thể đã đăng xuất: Token -> Expiration Epoch Seconds
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

    // Thời điểm thu hồi tất cả phiên của một User: UserId -> Revocation Epoch Seconds
    private final Map<UUID, Long> userRevocationTimestamps = new ConcurrentHashMap<>();

    /**
     * Đưa một Token vào danh sách đen khi người dùng bấm Đăng Xuất (Logout)
     */
    public void blacklistToken(String token, long expirationEpochSeconds) {
        if (token != null && !token.isBlank()) {
            blacklistedTokens.put(token, expirationEpochSeconds);
            log.info("[JWT_BLACKLIST] Đã thu hồi token (hết hạn vào epoch {})", expirationEpochSeconds);
        }
    }

    /**
     * Thu hồi tất cả phiên làm việc đang hoạt động của một User ID
     */
    public void revokeAllSessionsForUser(UUID userId) {
        long now = Instant.now().getEpochSecond();
        userRevocationTimestamps.put(userId, now);
        log.warn("[USER_SESSIONS_REVOKED] Toàn bộ phiên của người dùng {} đã bị thu hồi lúc epoch {}", userId, now);
    }

    /**
     * Kiểm tra xem Token có nằm trong danh sách đen hoặc được cấp trước thời điểm thu hồi phiên không
     */
    public boolean isTokenRevoked(String token, UUID userId, Long tokenIssuedAtEpoch) {
        if (token == null) return false;

        // 1. Kiểm tra token có nằm trong blacklist cá nhân không
        Long expiry = blacklistedTokens.get(token);
        if (expiry != null) {
            long now = Instant.now().getEpochSecond();
            if (now < expiry) {
                return true;
            } else {
                blacklistedTokens.remove(token);
            }
        }

        // 2. Kiểm tra nếu tài khoản bị Admin hoặc chính người dùng bấm "Thu hồi tất cả phiên"
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
     * Tự động dọn dẹp các token đã hết hạn tự nhiên để giải phóng bộ nhớ
     */
    @Scheduled(fixedRate = 900000) // 15 phút
    public void cleanupExpiredTokens() {
        long now = Instant.now().getEpochSecond();
        blacklistedTokens.entrySet().removeIf(entry -> now >= entry.getValue());
    }
}
