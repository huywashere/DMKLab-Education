package com.example.learning.platform.storage;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class CloudflareR2StorageService implements StorageService {

    private final StorageProperties properties;

    public CloudflareR2StorageService(StorageProperties properties) {
        this.properties = properties;
    }

    private S3Presigner s3Presigner;

    @PostConstruct
    public void init() {
        StorageProperties.R2Properties r2 = properties.getR2();
        if (r2.isConfigured()) {
            try {
                String endpoint = r2.getEndpoint();
                this.s3Presigner = S3Presigner.builder()
                        .endpointOverride(URI.create(endpoint))
                        .credentialsProvider(StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(r2.getAccessKey(), r2.getSecretKey())
                        ))
                        .region(Region.of("auto"))
                        .serviceConfiguration(S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .build())
                        .build();
                log.info("[STORAGE] Khởi tạo thành công Cloudflare R2 Storage (S3 API). Bucket: {}, Endpoint: {}",
                        r2.getBucket(), endpoint);
            } catch (Exception e) {
                log.warn("[STORAGE] Không thể khởi tạo Cloudflare R2 S3Presigner (Kiểm tra cấu hình R2 credentials): {}", e.getMessage());
            }
        } else {
            log.info("[STORAGE] Cloudflare R2 đang ở chế độ Emulation/Mock (Chưa cung cấp R2_ACCOUNT_ID / R2_ACCESS_KEY_ID).");
        }
    }

    @PreDestroy
    public void cleanup() {
        if (s3Presigner != null) {
            try {
                s3Presigner.close();
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public StorageDto.PresignedUploadResponse createPresignedUploadUrl(
            String originalFilename,
            String contentType,
            long fileSizeBytes,
            String directory) {

        String safeDir = (directory == null || directory.isBlank())
                ? "media/k12"
                : directory.replace("..", "_").replaceAll("^/+|/+$", "");

        String rawName = (originalFilename == null || originalFilename.isBlank()) ? "asset.bin" : originalFilename;
        String baseName = rawName.replace("\\", "/");
        if (baseName.contains("/")) {
            baseName = baseName.substring(baseName.lastIndexOf('/') + 1);
        }
        String cleanFilename = baseName.replace("..", "_").replaceAll("[^a-zA-Z0-9._-]", "_");
        String storageKey = String.format("%s/%s/%s", safeDir, UUID.randomUUID(), cleanFilename);

        StorageProperties.R2Properties r2 = properties.getR2();
        int expirySeconds = r2.getPresignedExpirySeconds() > 0 ? r2.getPresignedExpirySeconds() : 900;
        String publicCdnBase = r2.getPublicUrl() != null ? r2.getPublicUrl().replaceAll("/+$", "") : "https://media.dmklab.edu.vn";
        String publicCdnUrl = publicCdnBase + "/" + storageKey;
        String hlsStreamingUrl = publicCdnBase + "/hls/" + storageKey.replaceAll("\\.[^.]+$", "") + "/master.m3u8";

        if (s3Presigner != null && r2.isConfigured()) {
            try {
                PutObjectRequest objectRequest = PutObjectRequest.builder()
                        .bucket(r2.getBucket())
                        .key(storageKey)
                        .contentType(contentType != null && !contentType.isBlank() ? contentType : "application/octet-stream")
                        .build();

                PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofSeconds(expirySeconds))
                        .putObjectRequest(objectRequest)
                        .build();

                PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);
                String liveUploadUrl = presigned.url().toString();

                log.info("[STORAGE_R2_LIVE] Đã cấp Presigned URL Cloudflare R2 cho key: {}", storageKey);

                return StorageDto.PresignedUploadResponse.builder()
                        .uploadUrl(liveUploadUrl)
                        .storageKey(storageKey)
                        .publicCdnUrl(publicCdnUrl)
                        .hlsStreamingUrl(hlsStreamingUrl)
                        .expiresInSeconds(expirySeconds)
                        .provider("Cloudflare R2 (SigV4 Live)")
                        .isLiveConfigured(true)
                        .message("Presigned URL Cloudflare R2 hợp lệ. Trình duyệt tải thẳng lên Cloudflare Edge với 0đ phí Egress.")
                        .build();
            } catch (Exception e) {
                log.error("[STORAGE_R2_ERROR] Lỗi khi tạo presigned URL qua AWS SDK: {}", e.getMessage(), e);
            }
        }

        // Chế độ giả lập (Emulation / Mock) khi chưa điền API Key thực tế
        String fallbackEndpoint = r2.getEndpoint() != null ? r2.getEndpoint() : "https://r2.dmklab.cloudflarestorage.com";
        String mockUploadUrl = String.format("%s/%s/%s?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=%d&mock=true",
                fallbackEndpoint, r2.getBucket(), storageKey, expirySeconds);

        return StorageDto.PresignedUploadResponse.builder()
                .uploadUrl(mockUploadUrl)
                .storageKey(storageKey)
                .publicCdnUrl(publicCdnUrl)
                .hlsStreamingUrl(hlsStreamingUrl)
                .expiresInSeconds(expirySeconds)
                .provider("Cloudflare R2 (Chế độ giả lập / Sẵn sàng tích hợp Key)")
                .isLiveConfigured(false)
                .message("Hệ thống đã cấu hình sẵn sàng Cloudflare R2. Để kích hoạt Live Upload, vui lòng thêm R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY vào file .env.")
                .build();
    }

    @Override
    public String getPublicUrl(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return "";
        String base = properties.getR2().getPublicUrl() != null ? properties.getR2().getPublicUrl().replaceAll("/+$", "") : "https://media.dmklab.edu.vn";
        return base + "/" + storageKey.replaceAll("^/+", "");
    }

    @Override
    public StorageDto.StorageProviderInfo getProviderInfo() {
        StorageProperties.R2Properties r2 = properties.getR2();
        boolean isConfigured = r2.isConfigured() && s3Presigner != null;

        return StorageDto.StorageProviderInfo.builder()
                .activeProvider("CLOUDFLARE_R2")
                .endpoint(r2.getEndpoint() != null ? r2.getEndpoint() : "https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com")
                .bucket(r2.getBucket())
                .publicCdnUrl(r2.getPublicUrl())
                .configured(isConfigured)
                .zeroEgressFee(true)
                .supportedFeatures(List.of(
                        "Zero Bandwidth Egress Fee (Miễn phí 100% dung lượng tải ra cho học sinh xem video)",
                        "Presigned Direct S3 Upload (Trình duyệt tải thẳng lên Cloudflare, giải phóng tải Spring Boot)",
                        "Global Cloudflare Edge CDN Caching (Tối ưu hóa độ trễ tải bài giảng K-12 toàn cầu)",
                        "S3-Compatible API (Tương thích 100% chuẩn AWS S3 SigV4)"
                ))
                .guide(isConfigured
                        ? "Cloudflare R2 đang ở trạng thái KẾT NỐI THỰC TẾ (LIVE)."
                        : "Vui lòng đặt các biến môi trường: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET trong file .env để chuyển sang chế độ LIVE.")
                .build();
    }
}
