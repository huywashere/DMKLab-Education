package com.example.learning.platform.storage;

public interface StorageService {

    /**
     * Cấp Presigned Upload URL cho Client tải tệp tin thẳng lên Cloudflare R2 / S3
     * Không qua CPU & băng thông của Spring Boot (Zero Server Load).
     */
    StorageDto.PresignedUploadResponse createPresignedUploadUrl(
            String originalFilename,
            String contentType,
            long fileSizeBytes,
            String directory
    );

    /**
     * Lấy URL công khai CDN (Cloudflare Custom Domain / R2.dev)
     */
    String getPublicUrl(String storageKey);

    /**
     * Kiểm tra trạng thái và thông tin nhà cung cấp lưu trữ (R2 vs S3)
     */
    StorageDto.StorageProviderInfo getProviderInfo();
}
