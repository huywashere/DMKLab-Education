package com.example.learning.platform.notification;

import com.example.learning.platform.api.ApiResponse;
import com.example.learning.platform.email.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications & Email Gateway", description = "Dịch vụ thông báo và gửi Email qua Resend/SMTP/Gateway")
public class NotificationController {

    private final EmailService emailService;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestEmailRequest {
        @NotBlank(message = "Email người nhận không được để trống")
        @Email(message = "Email không hợp lệ")
        private String to;
        private String subject;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParentWeeklyReportRequest {
        @NotBlank(message = "Email phụ huynh không được để trống")
        @Email(message = "Email phụ huynh không hợp lệ")
        private String parentEmail;

        @NotBlank(message = "Tên học sinh không được để trống")
        private String studentName;

        private int studyMinutes = 180;
        private int energyPoints = 350;
        private int quizzesDone = 8;
        private double avgScore = 92.5;
        private String socraticAiFeedback = "Em hoàn thành rất xuất sắc chuyên đề Phương trình bậc hai môn Toán. Cần rèn luyện thêm phần giải bài toán bằng cách lập hệ phương trình.";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StreakReminderRequest {
        @NotBlank(message = "Email học sinh không được để trống")
        @Email(message = "Email không hợp lệ")
        private String studentEmail;

        @NotBlank(message = "Tên học sinh không được để trống")
        private String studentName;

        private int streakDays = 7;
    }

    @PostMapping("/email/test")
    @Operation(summary = "Kiểm tra kết nối Email Gateway (Resend / SMTP / Emulation)")
    public ResponseEntity<ApiResponse<String>> testEmailGateway(@RequestBody TestEmailRequest req) {
        String sub = (req.getSubject() != null && !req.getSubject().isBlank())
                ? req.getSubject()
                : "🧪 [DMKLab Test] Kiểm tra kết nối Email Gateway thành công!";

        String html = """
            <div style="font-family: sans-serif; padding: 24px; background: #0B1528; color: #FFFFFF; border-radius: 12px;">
              <h2 style="color: #10B981;">Kết nối Email Gateway Thành Công!</h2>
              <p>Email này được gửi tự động từ hệ thống DMKLab Education K-12 để kiểm tra trạng thái hoạt động của Resend/SMTP Gateway.</p>
              <p style="color: #94A3B8; font-size: 12px;">Thời gian gửi: %s</p>
            </div>
            """.formatted(java.time.Instant.now().toString());

        boolean sent = emailService.sendEmail(req.getTo(), sub, html);
        if (sent) {
            return ResponseEntity.ok(ApiResponse.success("Email kiểm tra đã được gửi thành công tới: " + req.getTo()));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không thể gửi email kiểm tra. Vui lòng kiểm tra lại cấu hình Gateway."));
        }
    }

    @PostMapping("/parent/weekly-report")
    @Operation(summary = "Gửi báo cáo tiến độ tuần tự động về email của phụ huynh")
    public ResponseEntity<ApiResponse<String>> sendParentWeeklyReport(@RequestBody ParentWeeklyReportRequest req) {
        boolean sent = emailService.sendWeeklyParentReport(
                req.getParentEmail(),
                req.getStudentName(),
                req.getStudyMinutes(),
                req.getEnergyPoints(),
                req.getQuizzesDone(),
                req.getAvgScore(),
                req.getSocraticAiFeedback()
        );

        if (sent) {
            return ResponseEntity.ok(ApiResponse.success("Báo cáo tuần về tiến độ của học sinh '" + req.getStudentName() + "' đã được gửi tới email phụ huynh: " + req.getParentEmail()));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không thể gửi báo cáo tuần."));
        }
    }

    @PostMapping("/study-reminder")
    @Operation(summary = "Gửi email nhắc nhở học sinh duy trì chuỗi Streak học tập")
    public ResponseEntity<ApiResponse<String>> sendStreakReminder(@RequestBody StreakReminderRequest req) {
        boolean sent = emailService.sendStreakReminderEmail(
                req.getStudentEmail(),
                req.getStudentName(),
                req.getStreakDays()
        );

        if (sent) {
            return ResponseEntity.ok(ApiResponse.success("Đã gửi email nhắc giữ streak " + req.getStreakDays() + " ngày tới: " + req.getStudentEmail()));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không thể gửi email nhắc nhở."));
        }
    }
}

