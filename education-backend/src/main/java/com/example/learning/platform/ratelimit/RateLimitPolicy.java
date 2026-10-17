package com.example.learning.platform.ratelimit;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RateLimitPolicy {
    AUTH_LOGIN("Xác thực đăng nhập", 5, 900, "Chống tấn công Brute-force & Credential Stuffing"),
    AUTH_REGISTER("Đăng ký tài khoản", 3, 1800, "Chống bot tạo hàng loạt tài khoản rác"),
    AUTH_PASSWORD_CHANGE("Đổi mật khẩu", 5, 900, "Chống dò quét và lạm dụng đổi mật khẩu"),
    AI_CHAT("Gia sư AI Socratic & Admin Chat", 15, 60, "Chống rút cạn Token, chi phí API & DoS AI"),
    ASSESSMENT_SUBMIT("Nộp bài thi & Quiz", 10, 60, "Chống spam đáp án và farm điểm năng lượng ảo"),
    PROGRESS_HEARTBEAT("Đồng bộ tiến độ video", 30, 60, "Chống flood request giả mạo thời lượng học"),
    PUBLIC_CONTACT("Gửi liên hệ & góp ý", 3, 600, "Chống spam tin nhắn rác & bot hòm thư"),
    ADMIN_OPERATIONS("Tác vụ quản trị nặng", 60, 60, "Chống nghẽn tài nguyên database aggregation"),
    DEFAULT_GLOBAL("Toàn hệ thống K-12", 120, 60, "Bảo vệ chung chống crawler/scraper quá tải");

    private final String description;
    private final int maxRequests;
    private final long windowSeconds;
    private final String purpose;
}
