package com.example.learning.identity.service;

import com.example.learning.identity.dto.AuthDto;
import com.example.learning.identity.entity.User;
import com.example.learning.identity.entity.UserRole;
import com.example.learning.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + id));
    }

    public AuthDto.UserDto getUserProfile(UUID id) {
        return toDto(findById(id));
    }

    @Transactional
    public User register(AuthDto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng: " + req.getEmail());
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại: " + req.getUsername());
        }

        UserRole role = UserRole.STUDENT;
        if (req.getRole() != null && !req.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(req.getRole().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                role = UserRole.STUDENT;
            }
        }

        String defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + req.getUsername();

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .role(role)
                .avatarUrl(defaultAvatar)
                .bio("Chào mừng bạn đến với Khan Academy K-12!")
                .energyPoints(1000)
                .streakDays(1)
                .active(true)
                .build();

        return userRepository.save(user);
    }

    public User authenticate(String usernameOrEmail, String password) {
        User user = userRepository.findByEmail(usernameOrEmail)
                .orElseGet(() -> userRepository.findByUsername(usernameOrEmail)
                        .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại")));

        if (!user.isActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu không đúng");
        }
        return user;
    }

    @Transactional
    public AuthDto.UserDto updateProfile(UUID userId, AuthDto.UpdateProfileRequest req) {
        User user = findById(userId);
        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName());
        }
        if (req.getAvatarUrl() != null && !req.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(req.getAvatarUrl());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio());
        }
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        User user = findById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthDto.UserDto toDto(User user) {
        return AuthDto.UserDto.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .energyPoints(user.getEnergyPoints())
                .streakDays(user.getStreakDays())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
