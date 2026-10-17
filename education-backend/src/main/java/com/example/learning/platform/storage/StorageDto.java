package com.example.learning.platform.storage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class StorageDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PresignedUploadResponse {
        private String uploadUrl;
        private String storageKey;
        private String publicCdnUrl;
        private String hlsStreamingUrl;
        private int expiresInSeconds;
        private String provider;
        private boolean isLiveConfigured;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StorageProviderInfo {
        private String activeProvider;
        private String endpoint;
        private String bucket;
        private String publicCdnUrl;
        private boolean configured;
        private boolean zeroEgressFee;
        private List<String> supportedFeatures;
        private String guide;
    }
}
