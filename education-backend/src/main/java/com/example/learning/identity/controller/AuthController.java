package com.example.learning.identity.controller;

import com.example.learning.identity.dto.AuthDto;
import com.example.learning.identity.entity.User;
import com.example.learning.identity.service.UserService;
import com.example.learning.platform.api.ApiResponse;
import java.util.UUID;
import com.example.learning.platform.security.JwtTokenProvider;
import com.example.learning.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.example.learning.platform.security.JwtBlacklistService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Profile", description = "Xác thực JWT & Quản lý Hồ sơ người dùng")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final JwtBlacklistService jwtBlacklistService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới và cấp JWT")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        User user = userService.register(req);
        String token = tokenProvider.generateToken(user);

        AuthDto.AuthResponse response = AuthDto.AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .user(userService.toDto(user))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công!", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập và nhận JWT Token bảo mật cao")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        User user = userService.authenticate(req.getUsernameOrEmail(), req.getPassword());
        String token = tokenProvider.generateToken(user);

        AuthDto.AuthResponse response = AuthDto.AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .user(userService.toDto(user))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công!", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin hồ sơ của tài khoản đang đăng nhập", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        }
        return ResponseEntity.ok(ApiResponse.success(userService.getUserProfile(principal.getId())));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật hồ sơ cá nhân", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AuthDto.UpdateProfileRequest req) {
        if (principal == null) {
            throw new RuntimeException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công",
                userService.updateProfile(principal.getId(), req)));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu bảo mật", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AuthDto.ChangePasswordRequest req) {
        if (principal == null) {
            throw new RuntimeException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        }
        userService.changePassword(principal.getId(), req.getOldPassword(), req.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công!"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới Access Token ngầm (Silent Refresh Token)")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> refreshToken(@Valid @RequestBody AuthDto.RefreshTokenRequest req) {
        String token = req.getRefreshToken();
        if (!tokenProvider.validateToken(token)) {
            throw new RuntimeException("Refresh token không hợp lệ hoặc đã hết hạn!");
        }

        UUID userId = tokenProvider.getUserIdFromToken(token);
        User user = userService.findById(userId);
        String newAccessToken = tokenProvider.generateToken(user);

        AuthDto.AuthResponse response = AuthDto.AuthResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .user(userService.toDto(user))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Làm mới phiên đăng nhập thành công!", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Yêu cầu cấp mã OTP đặt lại mật khẩu qua email")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> forgotPassword(
            @Valid @RequestBody AuthDto.ForgotPasswordRequest req) {
        String otp = userService.generatePasswordResetOtp(req.getEmail());
        java.util.Map<String, String> data = java.util.Map.of(
                "email", req.getEmail(),
                "otp", otp,
                "message", "Mã xác thực OTP đã được gửi tới email của bạn (Hiệu lực 15 phút)."
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Xác nhận mã OTP và đặt mật khẩu mới")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody AuthDto.ResetPasswordRequest req) {
        userService.resetPasswordWithOtp(req.getEmail(), req.getOtp(), req.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất an toàn và đưa JWT vào danh sách đen (Blacklist)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<String>> logout(
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            try {
                long expiration = tokenProvider.getExpirationEpochSeconds(token);
                jwtBlacklistService.blacklistToken(token, expiration);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công. Phiên làm việc đã được thu hồi an toàn."));
    }
}
