package com.example.learning.platform.storage;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private String provider = "r2"; // "r2" hoặc "minio" / "s3"
    private R2Properties r2 = new R2Properties();
    private S3Properties s3 = new S3Properties();

    @Data
    public static class R2Properties {
        private String accountId;
        private String bucket = "education-media";
        private String accessKey;
        private String secretKey;
        private String publicUrl = "https://media.dmklab.edu.vn";
        private int presignedExpirySeconds = 900;

        public String getEndpoint() {
            if (accountId != null && !accountId.isBlank()) {
                return "https://" + accountId.trim() + ".r2.cloudflarestorage.com";
            }
            return null;
        }

        public boolean isConfigured() {
            return accountId != null && !accountId.isBlank()
                    && accessKey != null && !accessKey.isBlank()
                    && secretKey != null && !secretKey.isBlank()
                    && !"mock-key".equalsIgnoreCase(accessKey);
        }
    }

    @Data
    public static class S3Properties {
        private String endpoint = "http://localhost:9000";
        private String bucket = "education-media";
        private String accessKey = "minioadmin";
        private String secretKey = "minioadmin";
        private String region = "us-east-1";
    }
}
