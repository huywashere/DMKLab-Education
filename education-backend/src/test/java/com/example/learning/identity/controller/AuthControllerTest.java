package com.example.learning.identity.controller;

import com.example.learning.identity.dto.AuthDto;
import com.example.learning.identity.entity.User;
import com.example.learning.identity.entity.UserRole;
import com.example.learning.identity.service.UserService;
import com.example.learning.platform.security.JwtBlacklistService;
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

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("Controller Test: AuthController (Xác thực & Cấp JWT Bearer Token)")
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private JwtBlacklistService jwtBlacklistService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("POST /api/v1/auth/login thành công phải trả về JWT Token và thông tin user")
    void shouldLoginSuccessfully() throws Exception {
        AuthDto.LoginRequest loginReq = new AuthDto.LoginRequest();
        loginReq.setUsernameOrEmail("student1");
        loginReq.setPassword("Password123!");

        User mockUser = User.builder()
                .id(UUID.randomUUID())
                .username("student1")
                .email("student1@example.com")
                .fullName("Trần Văn An")
                .role(UserRole.STUDENT)
                .build();

        AuthDto.UserDto mockUserDto = AuthDto.UserDto.builder()
                .id(mockUser.getId().toString())
                .username(mockUser.getUsername())
                .email(mockUser.getEmail())
                .fullName(mockUser.getFullName())
                .role("STUDENT")
                .build();

        when(userService.authenticate(anyString(), anyString())).thenReturn(mockUser);
        when(tokenProvider.generateToken(any(User.class))).thenReturn("mocked.jwt.token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);
        when(userService.toDto(any(User.class))).thenReturn(mockUserDto);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.username").value("student1"));

        verify(userService, times(1)).authenticate("student1", "Password123!");
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout phải đưa token vào Blacklist")
    void shouldLogoutAndBlacklistToken() throws Exception {
        String testToken = "sample.jwt.token";

        when(tokenProvider.getExpirationEpochSeconds(testToken)).thenReturn(Instant.now().getEpochSecond() + 3600);
        doNothing().when(jwtBlacklistService).blacklistToken(eq(testToken), anyLong());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(jwtBlacklistService, times(1)).blacklistToken(eq(testToken), anyLong());
    }
}
