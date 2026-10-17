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

    private final java.util.concurrent.ConcurrentHashMap<String, FailedLoginRecord> failedLogins = new java.util.concurrent.ConcurrentHashMap<>();

    private static class FailedLoginRecord {
        int attempts;
        long lastAttemptTime;

        FailedLoginRecord(int attempts, long lastAttemptTime) {
            this.attempts = attempts;
            this.lastAttemptTime = lastAttemptTime;
        }
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + id));
    }

    @org.springframework.cache.annotation.Cacheable(value = com.example.learning.platform.config.CacheConfig.CACHE_USER_PROFILES, key = "#id.toString()")
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
                .bio("Chào mừng bạn đến với DMKLab Education K-12!")
                .energyPoints(1000)
                .streakDays(1)
                .active(true)
                .build();

        return userRepository.save(user);
    }

    public User authenticate(String usernameOrEmail, String password) {
        String key = usernameOrEmail.toLowerCase().trim();
        long now = System.currentTimeMillis();
        long lockoutDurationMs = 15 * 60 * 1000; // 15 phút

        FailedLoginRecord record = failedLogins.get(key);
        if (record != null) {
            if (now - record.lastAttemptTime < lockoutDurationMs) {
                if (record.attempts >= 5) {
                    long remainingMins = Math.max(1, (lockoutDurationMs - (now - record.lastAttemptTime)) / 60000);
                    throw new RuntimeException("Tài khoản đã bị tạm khóa " + remainingMins + " phút do nhập sai mật khẩu quá 5 lần liên tiếp (Chống Brute-force/Credential Stuffing).");
                }
            } else {
                record.attempts = 0;
            }
        }

        User user = userRepository.findByEmail(usernameOrEmail)
                .orElseGet(() -> userRepository.findByUsername(usernameOrEmail)
                        .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại")));

        if (!user.isActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            int currentAttempts = (record != null && (now - record.lastAttemptTime < lockoutDurationMs)) ? record.attempts + 1 : 1;
            failedLogins.put(key, new FailedLoginRecord(currentAttempts, now));
            int remainingAttempts = Math.max(0, 5 - currentAttempts);
            if (remainingAttempts == 0) {
                throw new RuntimeException("Mật khẩu không đúng. Tài khoản của bạn đã bị tạm khóa bảo vệ 15 phút!");
            } else {
                throw new RuntimeException("Mật khẩu không đúng. Bạn còn " + remainingAttempts + " lần thử trước khi tài khoản bị khóa 15 phút.");
            }
        }

        failedLogins.remove(key);
        return user;
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = com.example.learning.platform.config.CacheConfig.CACHE_USER_PROFILES, key = "#userId.toString()")
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
    @org.springframework.cache.annotation.CacheEvict(value = com.example.learning.platform.config.CacheConfig.CACHE_USER_PROFILES, key = "#userId.toString()")
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
