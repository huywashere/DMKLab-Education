package com.example.learning.platform.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CloudflareR2StorageServiceTest {

    private StorageProperties storageProperties;
    private CloudflareR2StorageService storageService;

    @BeforeEach
    void setUp() {
        storageProperties = new StorageProperties();
        storageProperties.setProvider("r2");
        storageProperties.getR2().setBucket("education-media-test");
        storageProperties.getR2().setPublicUrl("https://media.dmklab.edu.vn");
        storageProperties.getR2().setPresignedExpirySeconds(600);

        storageService = new CloudflareR2StorageService(storageProperties);
        storageService.init();
    }

    @Test
    @DisplayName("Cấp Presigned URL Cloudflare R2 ở chế độ Emulation khi chưa cấu hình API Key")
    void shouldGeneratePresignedUrl() {
        StorageDto.PresignedUploadResponse response = storageService.createPresignedUploadUrl(
                "toan_lop_10_ham_so.mp4",
                "video/mp4",
                52428800L,
                "videos/k12"
        );

        assertNotNull(response);
        assertNotNull(response.getUploadUrl());
        assertTrue(response.getUploadUrl().contains("education-media-test"));
        assertTrue(response.getStorageKey().startsWith("videos/k12/"));
        assertTrue(response.getStorageKey().endsWith("toan_lop_10_ham_so.mp4"));
        assertTrue(response.getPublicCdnUrl().startsWith("https://media.dmklab.edu.vn/videos/k12/"));
        assertTrue(response.getHlsStreamingUrl().endsWith("/master.m3u8"));
        assertEquals(600, response.getExpiresInSeconds());
        assertFalse(response.isLiveConfigured());
    }

    @Test
    @DisplayName("Làm sạch tên file nguy hiểm và chuẩn hóa đường dẫn thư mục")
    void shouldSanitizeDangerousFilename() {
        StorageDto.PresignedUploadResponse response = storageService.createPresignedUploadUrl(
                "video ../hack&bad!@#$%.mp4",
                "video/mp4",
                1024L,
                "/custom/folder//"
        );

        assertNotNull(response);
        assertFalse(response.getStorageKey().contains(".."));
        assertFalse(response.getStorageKey().contains("&"));
        assertTrue(response.getStorageKey().startsWith("custom/folder/"));
    }

    @Test
    @DisplayName("Trả về thông tin chi tiết nhà cung cấp Cloudflare R2 và tính năng Zero Egress")
    void shouldProvideR2ProviderInfo() {
        StorageDto.StorageProviderInfo info = storageService.getProviderInfo();

        assertNotNull(info);
        assertEquals("CLOUDFLARE_R2", info.getActiveProvider());
        assertEquals("education-media-test", info.getBucket());
        assertTrue(info.isZeroEgressFee());
        assertNotNull(info.getSupportedFeatures());
        assertFalse(info.getSupportedFeatures().isEmpty());
    }

    @Test
    @DisplayName("Lấy URL CDN công khai cho storage key")
    void shouldReturnPublicCdnUrl() {
        String key = "images/avatars/user_123.png";
        String publicUrl = storageService.getPublicUrl(key);

        assertEquals("https://media.dmklab.edu.vn/images/avatars/user_123.png", publicUrl);
    }
}
