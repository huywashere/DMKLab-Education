package com.example.learning.platform.ratelimit;

import lombok.Getter;

@Getter
public class RateLimitExceededException extends RuntimeException {
    private final RateLimitPolicy policy;
    private final long retryAfterSeconds;

    public RateLimitExceededException(RateLimitPolicy policy, long retryAfterSeconds) {
        super(String.format("Yêu cầu bị giới hạn tốc độ [%s]. Vui lòng thử lại sau %d giây.", policy.getDescription(), retryAfterSeconds));
        this.policy = policy;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
