package com.example.learning.platform.admin;

import com.example.learning.audit.entity.AuditLog;
import com.example.learning.audit.service.AuditService;
import com.example.learning.content.repository.LessonRepository;
import com.example.learning.identity.entity.User;
import com.example.learning.identity.entity.UserRole;
import com.example.learning.identity.repository.UserRepository;
import com.example.learning.platform.api.ApiResponse;
import com.example.learning.platform.security.UserPrincipal;
import com.example.learning.progress.repository.LearningProgressRepository;
import com.example.learning.platform.ratelimit.RateLimiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.learning.platform.security.JwtBlacklistService;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin CMS", description = "Quản trị hệ thống, báo cáo tổng quan, RBAC và cấp S3 Presigned URL")
public class AdminController {

    private final AdminReportService adminReportService;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final LearningProgressRepository learningProgressRepository;
    private final AuditService auditService;
    private final RateLimiterService rateLimiterService;
    private final JwtBlacklistService jwtBlacklistService;
    private final org.springframework.cache.CacheManager cacheManager;

    @GetMapping("/reports/overview")
    @Operation(summary = "Lấy báo cáo tổng quan KPI hệ thống và hạ tầng (Cache 60s)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AdminDto.OverviewReport>> getOverviewReport() {
        return ResponseEntity.ok(ApiResponse.success(adminReportService.getOverviewReport()));
    }

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách người dùng trong hệ thống kèm vai trò RBAC", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<AdminDto.AdminUserItem>>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String q) {

        List<User> users = userRepository.findAll();

        List<AdminDto.AdminUserItem> result = users.stream()
                .filter(u -> role == null || role.isBlank() || u.getRole().name().equalsIgnoreCase(role))
                .filter(u -> q == null || q.isBlank() ||
                        u.getFullName().toLowerCase().contains(q.toLowerCase()) ||
                        u.getUsername().toLowerCase().contains(q.toLowerCase()) ||
                        u.getEmail().toLowerCase().contains(q.toLowerCase()))
                .map(u -> AdminDto.AdminUserItem.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .role(u.getRole())
                        .active(u.isActive())
                        .energyPoints(u.getEnergyPoints())
                        .streakDays(u.getStreakDays())
                        .bio(u.getBio())
                        .avatarUrl(u.getAvatarUrl())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Cập nhật trạng thái kích hoạt/vô hiệu hóa tài khoản", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AdminDto.AdminUserItem>> toggleUserStatus(
            @PathVariable UUID userId,
            @RequestBody AdminDto.UpdateStatusRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + userId));

        user.setActive(req.isActive());
        userRepository.save(user);

        UUID adminId = principal != null ? principal.getId() : UUID.fromString("11111111-1111-1111-1111-111111111111");
        auditService.logAction(
                adminId,
                req.isActive() ? "ENABLE_USER" : "DISABLE_USER",
                "USER",
                userId.toString(),
                "Cập nhật trạng thái người dùng: " + user.getUsername() + " -> " + (req.isActive() ? "Kích hoạt" : "Vô hiệu hóa"),
                "127.0.0.1"
        );

        AdminDto.AdminUserItem resItem = AdminDto.AdminUserItem.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .active(user.isActive())
                .energyPoints(user.getEnergyPoints())
                .streakDays(user.getStreakDays())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái người dùng", resItem));
    }

    @GetMapping("/roles")
    @Operation(summary = "Lấy danh sách các vai trò RBAC hỗ trợ trong hệ thống")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableRoles() {
        List<String> roles = Arrays.stream(UserRole.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Lấy danh sách nhật ký kiểm toán mới nhất", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditService.getRecentLogs()));
    }

    @PostMapping("/media/upload-url")
    @Operation(summary = "Cấp URL ký có thời hạn để trình duyệt upload trực tiếp lên Object Storage (PDF Mục 8.2)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AdminDto.UploadUrlResponse>> getPresignedUploadUrl(
            @RequestBody AdminDto.UploadUrlRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        String filename = req.getFilename() != null ? req.getFilename() : "lesson_video.mp4";

        if (!com.example.learning.platform.security.FileSignatureValidator.isSafeFilename(filename)) {
            UUID actorId = principal != null ? principal.getId() : UUID.fromString("11111111-1111-1111-1111-111111111111");
            auditService.logAction(actorId, "MALICIOUS_UPLOAD_BLOCKED", "SECURITY", filename, "Phát hiện tệp tin chứa phần mở rộng thực thi hoặc ký tự nguy hiểm bị cấm", "127.0.0.1");
            throw new RuntimeException("Tên tệp tin không hợp lệ hoặc chứa định dạng thực thi nguy hiểm bị cấm.");
        }

        String storageKey = "videos/k12/" + UUID.randomUUID() + "/" + filename;
        String presignedUrl = "https://s3.ap-southeast-1.amazonaws.com/k12-education-media/" + storageKey + "?X-Amz-Signature=mock_sign_token_3600s";
        String cdnHlsUrl = "https://cdn.khan-k12.edu.vn/hls/" + storageKey.replace(".mp4", "") + "/master.m3u8";

        UUID actorId = principal != null ? principal.getId() : UUID.fromString("11111111-1111-1111-1111-111111111111");
        auditService.logAction(
                actorId,
                "REQUEST_UPLOAD_URL",
                "MEDIA_ASSET",
                storageKey,
                "Yêu cầu Presigned S3 Upload URL cho video: " + filename + " (" + req.getFileSizeBytes() + " bytes)",
                "127.0.0.1"
        );

        AdminDto.UploadUrlResponse response = AdminDto.UploadUrlResponse.builder()
                .uploadUrl(presignedUrl)
                .storageKey(storageKey)
                .expiresInSeconds(900)
                .hlsStreamingUrl(cdnHlsUrl)
                .message("Đã cấp URL ký thành công. Trình duyệt tải thẳng lên S3 mà không qua CPU Spring Boot.")
                .build();

        return ResponseEntity.ok(ApiResponse.success("Presigned URL đã sẵn sàng", response));
    }

    @GetMapping("/security/ratelimit-stats")
    @Operation(summary = "Lấy thống kê hệ thống chống spam và giám sát Rate Limiting thời gian thực", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<RateLimiterService.RateLimitStats>> getRateLimitStats() {
        return ResponseEntity.ok(ApiResponse.success(rateLimiterService.getStats()));
    }

    @PostMapping("/security/ratelimit/unblock")
    @Operation(summary = "Mở khóa thủ công IP hoặc Key bị chặn Rate Limit", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<String>> unblockRateLimitKey(@RequestParam String key) {
        boolean unblocked = rateLimiterService.unblockKey(key);
        if (unblocked) {
            return ResponseEntity.ok(ApiResponse.success("Đã mở khóa thành công cho key: " + key));
        }
        return ResponseEntity.ok(ApiResponse.success("Key không bị khóa hoặc đã hết hạn: " + key));
    }

    @PostMapping("/users/{userId}/revoke-sessions")
    @Operation(summary = "Thu hồi toàn bộ phiên đăng nhập của người dùng qua JWT Blacklist", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<String>> revokeUserSessions(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        jwtBlacklistService.revokeAllSessionsForUser(userId);
        UUID actorId = principal != null ? principal.getId() : UUID.fromString("11111111-1111-1111-1111-111111111111");
        auditService.logAction(actorId, "REVOKE_ALL_SESSIONS", "USER", userId.toString(), "Thu hồi toàn bộ phiên đăng nhập của người dùng qua JWT Blacklist", "127.0.0.1");
        return ResponseEntity.ok(ApiResponse.success("Đã thu hồi thành công toàn bộ phiên đăng nhập của người dùng."));
    }

    @GetMapping("/cache/stats")
    @Operation(summary = "Lấy trạng thái và danh sách các namespace cache đang hoạt động", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getCacheStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        RateLimiterService.RateLimitStats rlStats = rateLimiterService.getStats();
        stats.put("redisConnected", rlStats.isRedisConnected());
        stats.put("cacheType", rlStats.isRedisConnected() ? "Redis 7 Phân Tán (Cluster/Standalone)" : "In-Memory RAM Fallback");
        stats.put("activeNamespaces", cacheManager != null ? cacheManager.getCacheNames() : java.util.List.of());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/cache/clear")
    @Operation(summary = "Xóa rỗng bộ nhớ đệm cache (toàn bộ hoặc theo namespace)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<String>> clearCache(
            @RequestParam(required = false, defaultValue = "all") String namespace,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (cacheManager == null) {
            return ResponseEntity.ok(ApiResponse.success("CacheManager chưa được khởi tạo."));
        }

        if ("all".equalsIgnoreCase(namespace)) {
            for (String name : cacheManager.getCacheNames()) {
                var cache = cacheManager.getCache(name);
                if (cache != null) cache.clear();
            }
            UUID actorId = principal != null ? principal.getId() : UUID.fromString("11111111-1111-1111-1111-111111111111");
            auditService.logAction(actorId, "CACHE_FLUSH_ALL", "SYSTEM", "ALL", "Đã xóa toàn bộ bộ đệm cache hệ thống", "127.0.0.1");
            return ResponseEntity.ok(ApiResponse.success("Đã làm mới thành công toàn bộ cache hệ thống!"));
        } else {
            var cache = cacheManager.getCache(namespace);
            if (cache != null) {
                cache.clear();
                return ResponseEntity.ok(ApiResponse.success("Đã làm mới thành công namespace cache: " + namespace));
            }
            return ResponseEntity.ok(ApiResponse.error("Không tìm thấy namespace cache: " + namespace));
        }
    }
}
