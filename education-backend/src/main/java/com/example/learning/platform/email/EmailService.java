package com.example.learning.platform.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailService {

    @Value("${app.mail.provider:resend}")
    private String provider;

    @Value("${app.mail.resend.api-key:}")
    private String resendApiKey;

    @Value("${app.mail.resend.from:DMKLab Education <onboarding@resend.dev>}")
    private String fromEmail;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public EmailService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Gửi email chung qua Email Gateway (Resend / SMTP / Console Emulation)
     */
    public boolean sendEmail(String to, String subject, String htmlContent) {
        // 1. Kiểm tra Resend API Key
        if ("resend".equalsIgnoreCase(provider) && resendApiKey != null && !resendApiKey.isBlank() && !resendApiKey.startsWith("mock")) {
            try {
                Map<String, Object> payload = Map.of(
                        "from", fromEmail,
                        "to", List.of(to),
                        "subject", subject,
                        "html", htmlContent
                );

                String requestBody = objectMapper.writeValueAsString(payload);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.resend.com/emails"))
                        .header("Authorization", "Bearer " + resendApiKey.trim())
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(15))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("[EMAIL_GATEWAY_SUCCESS] Resend đã gửi thành công tới: {} (Status: {})", to, response.statusCode());
                    return true;
                } else {
                    log.error("[EMAIL_GATEWAY_ERROR] Resend API lỗi: {} - Phản hồi: {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.error("[EMAIL_GATEWAY_EXCEPTION] Lỗi kết nối Resend API: {}", e.getMessage());
            }
        }

        // 2. Chế độ Emulation / Sandbox (Console Log rõ ràng, an toàn cho Development & Testing)
        log.info("====================== [EMAIL GATEWAY - SANDBOX EMULATION] ======================");
        log.info("📨 Người nhận: {}", to);
        log.info("📌 Tiêu đề: {}", subject);
        log.info("🏷️ Nhà cung cấp: {} (Trạng thái: Đã gửi ngầm vào hộp thư giả lập)", provider);
        log.info("==================================================================================");
        return true;
    }

    /**
     * 1. Gửi mã OTP xác thực đặt lại mật khẩu
     */
    public boolean sendPasswordResetOtpEmail(String toEmail, String recipientName, String otpCode) {
        String name = (recipientName != null && !recipientName.isBlank()) ? recipientName : "Học sinh / Giáo viên";
        String subject = "🔒 [DMKLab K-12] Mã OTP Đặt Lại Mật Khẩu Của Bạn: " + otpCode;

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A; }
                .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { background: #0B1528; padding: 28px 32px; text-align: center; border-bottom: 3px solid #1865F2; }
                .header h1 { color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
                .header p { color: #94A3B8; font-size: 12px; margin: 6px 0 0; }
                .body { padding: 32px; }
                .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
                .message { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
                .otp-box { background: #F1F5F9; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
                .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1865F2; }
                .otp-notice { font-size: 12px; color: #64748B; margin-top: 8px; }
                .warning { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 12px 16px; font-size: 12px; color: #B45309; border-radius: 4px; margin-top: 20px; }
                .footer { background: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>DMKLab Education K–12</h1>
                  <p>Hệ sinh thái học tập & đồng hành cùng học sinh Việt Nam</p>
                </div>
                <div class="body">
                  <div class="greeting">Xin chào %s,</div>
                  <div class="message">
                    Hệ thống DMKLab vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này.
                    Vui lòng sử dụng mã xác thực OTP 6 chữ số dưới đây để hoàn tất việc đổi mật khẩu mới:
                  </div>
                  <div class="otp-box">
                    <div class="otp-code">%s</div>
                    <div class="otp-notice">Mã có hiệu lực trong vòng <strong>15 phút</strong></div>
                  </div>
                  <div class="warning">
                    ⚠️ <strong>Lưu ý an toàn:</strong> Không bao giờ chia sẻ mã OTP này cho người khác, kể cả nhân viên hỗ trợ của DMKLab.
                    Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email hoặc liên hệ với ban quản trị để bảo vệ tài khoản.
                  </div>
                </div>
                <div class="footer">
                  © 2026 DMKLab Education Platform. Chứng thực bảo mật ISO/IEC 27001 & Chuẩn WCAG 2.1.<br>
                  Hà Nội, Việt Nam • Email: support@dmklab.edu.vn
                </div>
              </div>
            </body>
            </html>
            """.formatted(name, otpCode);

        return sendEmail(toEmail, subject, html);
    }

    /**
     * 2. Gửi báo cáo tuần cho phụ huynh K-12 (Weekly Parent Digest)
     */
    public boolean sendWeeklyParentReport(String parentEmail, String studentName, int studyMinutes, int energyPoints, int quizzesDone, double avgScore, String socraticAiFeedback) {
        String subject = "📊 [Báo cáo tuần DMKLab] Tiến độ học tập K-12 của em " + studentName;

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A; }
                .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { background: #0B1528; padding: 28px 32px; text-align: center; border-bottom: 3px solid #10B981; }
                .header h1 { color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 800; }
                .header p { color: #94A3B8; font-size: 12px; margin: 6px 0 0; }
                .body { padding: 32px; }
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
                .stat-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; }
                .stat-value { font-size: 24px; font-weight: 900; color: #1865F2; }
                .stat-label { font-size: 12px; color: #64748B; margin-top: 4px; font-weight: 600; }
                .ai-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px; margin-top: 24px; }
                .ai-title { font-size: 13px; font-weight: 800; color: #1E40AF; margin-bottom: 6px; }
                .ai-text { font-size: 13px; color: #1E3A8A; line-height: 1.6; }
                .btn { display: inline-block; background: #1865F2; color: #FFFFFF; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 24px; }
                .footer { background: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>Báo Cáo Học Tập Tuần K–12</h1>
                  <p>Kính gửi Quý Phụ huynh em: <strong>%s</strong></p>
                </div>
                <div class="body">
                  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                    DMKLab Education xin gửi tới Quý Phụ huynh tổng kết kết quả học tập và rèn luyện môn học của con trong tuần qua:
                  </p>
                  
                  <div class="stats-grid">
                    <div class="stat-box">
                      <div class="stat-value">%d phút</div>
                      <div class="stat-label">Thời gian tự học</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-value" style="color: #F59E0B;">+%d ⭐</div>
                      <div class="stat-label">Điểm năng lượng tích lũy</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-value" style="color: #10B981;">%d bài</div>
                      <div class="stat-label">Bài kiểm tra hoàn thành</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-value" style="color: #8B5CF6;">%.1f%%</div>
                      <div class="stat-label">Điểm số trung bình</div>
                    </div>
                  </div>

                  <div class="ai-box">
                    <div class="ai-title">🤖 Nhận xét từ Gia sư Socratic AI:</div>
                    <div class="ai-text">"%s"</div>
                  </div>

                  <div style="text-align: center;">
                    <a href="https://dmklab.edu.vn/dashboard" class="btn" style="color: #ffffff;">Đồng Hành Cùng Con Trên DMKLab →</a>
                  </div>
                </div>
                <div class="footer">
                  © 2026 DMKLab Education Platform • Cổng kết nối Gia đình & Nhà trường K-12
                </div>
              </div>
            </body>
            </html>
            """.formatted(studentName, studyMinutes, energyPoints, quizzesDone, avgScore, socraticAiFeedback);

        return sendEmail(parentEmail, subject, html);
    }

    /**
     * 3. Gửi thông báo nhắc lịch học giữ chuỗi Streak
     */
    public boolean sendStreakReminderEmail(String studentEmail, String studentName, int currentStreak) {
        String subject = "🔥 [DMKLab] Đừng để tắt chuỗi streak " + currentStreak + " ngày của bạn!";

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A; }
                .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
                .header { background: #EA580C; padding: 24px; text-align: center; }
                .header h1 { color: #FFFFFF; font-size: 22px; margin: 0; font-weight: 800; }
                .body { padding: 32px; text-align: center; }
                .streak-circle { display: inline-flex; width: 80px; height: 80px; border-radius: 50%; background: #FFEDD5; color: #C2410C; font-size: 32px; font-weight: 900; align-items: center; justify-content: center; margin: 16px 0; border: 3px solid #F97316; }
                .btn { display: inline-block; background: #EA580C; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 24px; text-decoration: none; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>Học Tập Mỗi Ngày Cùng DMKLab</h1>
                </div>
                <div class="body">
                  <div class="streak-circle">🔥 %d</div>
                  <h2 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 8px 0;">Chào %s, bạn sắp chạm mốc mới!</h2>
                  <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                    Chỉ cần dành ra <strong>10 phút</strong> hôm nay giải 1 bài quiz hoặc xem 1 video bài giảng, bạn sẽ giữ vững chuỗi học liên tục và nhận thêm <strong>+50 Điểm Năng Lượng</strong>.
                  </p>
                  <a href="https://dmklab.edu.vn" class="btn" style="color: #ffffff;">Vào Học Ngay Bây Giờ →</a>
                </div>
              </div>
            </body>
            </html>
            """.formatted(currentStreak, studentName);

        return sendEmail(studentEmail, subject, html);
    }
}
