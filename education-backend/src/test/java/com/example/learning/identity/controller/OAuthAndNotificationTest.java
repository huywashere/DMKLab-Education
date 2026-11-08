package com.example.learning.identity.controller;

import com.example.learning.identity.dto.AuthDto;
import com.example.learning.identity.entity.User;
import com.example.learning.identity.entity.UserRole;
import com.example.learning.identity.service.UserService;
import com.example.learning.platform.email.EmailService;
import com.example.learning.platform.notification.NotificationController;
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

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit & Integration Test: Google/Microsoft OAuth2 SSO & Email Gateway Notification")
class OAuthAndNotificationTest {

    private MockMvc authMockMvc;
    private MockMvc notificationMockMvc;

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthController authController;

    private NotificationController notificationController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        authMockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        notificationController = new NotificationController(emailService);
        notificationMockMvc = MockMvcBuilders.standaloneSetup(notificationController).build();
    }

    @Test
    @DisplayName("SSO 1-Click: Đăng nhập Google Workspace for Education tự động cấp tài khoản học sinh K-12")
    void testGoogleOAuthLogin() throws Exception {
        UUID studentId = UUID.randomUUID();
        User mockStudent = User.builder()
                .id(studentId)
                .username("an.nguyen")
                .email("an.nguyen@thcs-chuvanan.edu.vn")
                .fullName("Nguyễn Hoàng An")
                .role(UserRole.STUDENT)
                .energyPoints(1000)
                .streakDays(1)
                .active(true)
                .build();

        AuthDto.UserDto userDto = AuthDto.UserDto.builder()
                .id(studentId.toString())
                .username("an.nguyen")
                .email("an.nguyen@thcs-chuvanan.edu.vn")
                .fullName("Nguyễn Hoàng An")
                .role("STUDENT")
                .energyPoints(1000)
                .streakDays(1)
                .build();

        when(userService.findAll()).thenReturn(Collections.emptyList());
        when(userService.registerOrLoginOAuth(any(AuthDto.OAuthLoginRequest.class))).thenReturn(mockStudent);
        when(userService.toDto(mockStudent)).thenReturn(userDto);
        when(tokenProvider.generateToken(mockStudent)).thenReturn("mock.jwt.google.token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthDto.OAuthLoginRequest req = AuthDto.OAuthLoginRequest.builder()
                .provider("GOOGLE")
                .email("an.nguyen@thcs-chuvanan.edu.vn")
                .fullName("Nguyễn Hoàng An")
                .avatarUrl("https://lh3.googleusercontent.com/sample")
                .build();

        authMockMvc.perform(post("/api/v1/auth/oauth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock.jwt.google.token"))
                .andExpect(jsonPath("$.data.user.email").value("an.nguyen@thcs-chuvanan.edu.vn"))
                .andExpect(jsonPath("$.data.schoolDomain").value("thcs-chuvanan.edu.vn"))
                .andExpect(jsonPath("$.data.newUser").value(true));
    }

    @Test
    @DisplayName("SSO 1-Click: Đăng nhập Microsoft 365 Education")
    void testMicrosoftOAuthLogin() throws Exception {
        UUID teacherId = UUID.randomUUID();
        User mockTeacher = User.builder()
                .id(teacherId)
                .username("phuong.mai")
                .email("phuong.mai@thcs-thucnghiem.edu.vn")
                .fullName("Cô Mai Phương")
                .role(UserRole.TEACHER)
                .energyPoints(1000)
                .streakDays(1)
                .active(true)
                .build();

        AuthDto.UserDto teacherDto = AuthDto.UserDto.builder()
                .id(teacherId.toString())
                .username("phuong.mai")
                .email("phuong.mai@thcs-thucnghiem.edu.vn")
                .fullName("Cô Mai Phương")
                .role("TEACHER")
                .energyPoints(1000)
                .streakDays(1)
                .build();

        when(userService.findAll()).thenReturn(Collections.emptyList());
        when(userService.registerOrLoginOAuth(any(AuthDto.OAuthLoginRequest.class))).thenReturn(mockTeacher);
        when(userService.toDto(mockTeacher)).thenReturn(teacherDto);
        when(tokenProvider.generateToken(mockTeacher)).thenReturn("mock.jwt.microsoft.token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthDto.OAuthLoginRequest req = AuthDto.OAuthLoginRequest.builder()
                .provider("MICROSOFT")
                .email("phuong.mai@thcs-thucnghiem.edu.vn")
                .fullName("Cô Mai Phương")
                .build();

        authMockMvc.perform(post("/api/v1/auth/oauth/microsoft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock.jwt.microsoft.token"))
                .andExpect(jsonPath("$.data.user.role").value("TEACHER"));
    }

    @Test
    @DisplayName("Email Gateway: Gửi báo cáo tiến độ tuần tự động cho phụ huynh K-12")
    void testSendParentWeeklyReport() throws Exception {
        when(emailService.sendWeeklyParentReport(
                eq("phuhuynh.an@gmail.com"),
                eq("Nguyễn Hoàng An"),
                eq(180),
                eq(350),
                eq(8),
                eq(92.5),
                anyString()
        )).thenReturn(true);

        NotificationController.ParentWeeklyReportRequest req = NotificationController.ParentWeeklyReportRequest.builder()
                .parentEmail("phuhuynh.an@gmail.com")
                .studentName("Nguyễn Hoàng An")
                .studyMinutes(180)
                .energyPoints(350)
                .quizzesDone(8)
                .avgScore(92.5)
                .socraticAiFeedback("Em học rất tốt.")
                .build();

        notificationMockMvc.perform(post("/api/v1/notifications/parent/weekly-report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(org.hamcrest.Matchers.containsString("phuhuynh.an@gmail.com")));
    }

    @Test
    @DisplayName("Email Gateway: Gửi email nhắc nhở học sinh duy trì chuỗi Streak")
    void testSendStreakReminder() throws Exception {
        when(emailService.sendStreakReminderEmail(
                eq("student.an@thcs-chuvanan.edu.vn"),
                eq("Nguyễn Hoàng An"),
                eq(7)
        )).thenReturn(true);

        NotificationController.StreakReminderRequest req = new NotificationController.StreakReminderRequest(
                "student.an@thcs-chuvanan.edu.vn",
                "Nguyễn Hoàng An",
                7
        );

        notificationMockMvc.perform(post("/api/v1/notifications/study-reminder")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(org.hamcrest.Matchers.containsString("7")));
    }
}
