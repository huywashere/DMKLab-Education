package com.example.learning.platform.ratelimit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateLimitResult {
    private boolean allowed;
    private int currentCount;
    private int maxRequests;
    private long remainingRequests;
    private long retryAfterSeconds;
    private long resetEpochSeconds;
    private String policyName;
    private String key;
}
