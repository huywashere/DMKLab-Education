package com.example.learning.platform.contact;

import com.example.learning.audit.service.AuditService;
import com.example.learning.platform.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Public Inquiries & Contact", description = "Biểu mẫu liên hệ & Phản hồi cộng đồng có cơ chế chống spam")
public class ContactController {

    private final AuditService auditService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactRequest {
        @NotBlank(message = "Họ tên không được để trống")
        private String fullName;

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        private String email;

        private String phone;
        private String role;
        private String grade;
        private String subject;

        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        private String message;

        // Anti-bot honeypot field (Phải để trống đối với người dùng thật)
        private String honeypot;
    }

    @PostMapping("/contact")
    @Operation(summary = "Gửi tin nhắn liên hệ / yêu cầu tư vấn học tập (Chống spam tự động)")
    public ResponseEntity<ApiResponse<String>> submitContact(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = servletRequest.getRemoteAddr();

        // 1. Kiểm tra Honeypot Bot Trap: nếu trường này có dữ liệu -> Chặn spam bot
        if (StringUtils.hasText(request.getHoneypot())) {
            log.warn("[SPAM_BOT_BLOCKED] Bot tự động điền trường honeypot từ IP: {}", clientIp);
            auditService.logAction(null, "SPAM_BOT_TRAPPED", "CONTACT", request.getEmail(), "Bẫy Honeypot kích hoạt thành công", clientIp);
            // Trả về thành công giả để đánh lừa bot không thử cách khác
            return ResponseEntity.ok(ApiResponse.success("Tin nhắn của bạn đã được tiếp nhận. Đội ngũ DMKLab sẽ phản hồi sớm nhất."));
        }

        // 2. Ghi nhận nhật ký liên hệ hợp lệ
        auditService.logAction(
                null,
                "CONTACT_INQUIRY_SUBMITTED",
                "CONTACT",
                request.getEmail(),
                String.format("Học viên/Phụ huynh [%s] gửi yêu cầu: %s", request.getFullName(), request.getSubject()),
                clientIp
        );

        log.info("[CONTACT_SUBMITTED] Từ {}: {} - {}", request.getEmail(), request.getFullName(), request.getSubject());
        return ResponseEntity.ok(ApiResponse.success("Tin nhắn của bạn đã được gửi thành công! Chuyên viên giáo dục DMKLab sẽ liên hệ lại qua email trong 24 giờ làm việc."));
    }
}
