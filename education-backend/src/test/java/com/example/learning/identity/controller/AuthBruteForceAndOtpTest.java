package com.example.learning.identity.controller;

import com.example.learning.identity.dto.AuthDto;
import com.example.learning.identity.entity.User;
import com.example.learning.identity.entity.UserRole;
import com.example.learning.identity.service.UserService;
import com.example.learning.platform.ratelimit.RateLimitPolicy;
import com.example.learning.platform.ratelimit.RateLimitResult;
import com.example.learning.platform.ratelimit.RateLimiterService;
import com.example.learning.platform.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("Security & Integration Test: Brute-Force, Silent Refresh Token & OTP Reset")
class AuthBruteForceAndOtpTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthController authController;

    private RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        rateLimiterService = new RateLimiterService();
    }

    @Test
    @DisplayName("Bảo vệ chống Brute-Force: Quá 5 lần thử đăng nhập phải bị khóa (HTTP 429)")
    void shouldLockoutAfterExceedingLoginAttempts() {
        String attackerIp = "192.168.1.99";
        RateLimitPolicy policy = RateLimitPolicy.AUTH_LOGIN;

        // 5 lần thử đầu tiên
        for (int i = 1; i <= 5; i++) {
            RateLimitResult r = rateLimiterService.checkRateLimit(policy, attackerIp);
            assertTrue(r.isAllowed(), "Lần thử #" + i + " vẫn được ghi nhận");
        }

        // Lần thử thứ 6 phải bị chặn ngay
        RateLimitResult blocked = rateLimiterService.checkRateLimit(policy, attackerIp);
        assertFalse(blocked.isAllowed(), "Lần thử thứ 6 phải bị khóa");
        assertTrue(blocked.getRetryAfterSeconds() > 0, "Phải có thời gian chờ (Retry-After)");
        assertEquals(0, blocked.getRemainingRequests());
    }

    @Test
    @DisplayName("Silent Refresh Token: Gửi refresh token hợp lệ phải nhận access token mới")
    void shouldRefreshAccessTokenSuccessfully() throws Exception {
        UUID userId = UUID.randomUUID();
        AuthDto.RefreshTokenRequest req = new AuthDto.RefreshTokenRequest();
        req.setRefreshToken("valid.refresh.token.string");

        User mockUser = User.builder()
                .id(userId)
                .username("student_an")
                .email("an.student@dmklab.edu.vn")
                .fullName("Trần Văn An")
                .role(UserRole.STUDENT)
                .build();

        AuthDto.UserDto userDto = AuthDto.UserDto.builder()
                .id(mockUser.getId().toString())
                .username("student_an")
                .email("an.student@dmklab.edu.vn")
                .fullName("Trần Văn An")
                .role("STUDENT")
                .build();

        when(tokenProvider.validateToken("valid.refresh.token.string")).thenReturn(true);
        when(tokenProvider.getUserIdFromToken("valid.refresh.token.string")).thenReturn(userId);
        when(userService.findById(userId)).thenReturn(mockUser);
        when(tokenProvider.generateToken(any(User.class))).thenReturn("new.refreshed.access.token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);
        when(userService.toDto(mockUser)).thenReturn(userDto);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new.refreshed.access.token"))
                .andExpect(jsonPath("$.data.user.username").value("student_an"));
    }

    @Test
    @DisplayName("Quên mật khẩu & OTP: Sinh mã 6 chữ số và đặt lại mật khẩu thành công")
    void shouldGenerateOtpAndResetPassword() throws Exception {
        String email = "an.student@dmklab.edu.vn";
        when(userService.generatePasswordResetOtp(email)).thenReturn("849201");

        AuthDto.ForgotPasswordRequest forgotReq = new AuthDto.ForgotPasswordRequest();
        forgotReq.setEmail(email);

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Bước 2: Reset mật khẩu với mã OTP
        AuthDto.ResetPasswordRequest resetReq = new AuthDto.ResetPasswordRequest();
        resetReq.setEmail(email);
        resetReq.setOtp("849201");
        resetReq.setNewPassword("NewSecurePassword2026!");

        doNothing().when(userService).resetPasswordWithOtp(email, "849201", "NewSecurePassword2026!");

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(userService, times(1)).resetPasswordWithOtp(email, "849201", "NewSecurePassword2026!");
    }
}
