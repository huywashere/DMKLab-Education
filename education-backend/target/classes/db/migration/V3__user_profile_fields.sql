-- V3__user_profile_fields.sql
-- Add profile fields for Khan Academy style gamification and profile details

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS energy_points INT NOT NULL DEFAULT 1000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_days INT NOT NULL DEFAULT 1;

UPDATE users SET energy_points = 15200, streak_days = 15, bio = 'Quản trị viên phát triển nền tảng Khan Academy K-12' WHERE username = 'admin';
UPDATE users SET energy_points = 8400, streak_days = 9, bio = 'Giáo viên Toán & Khoa học Tự nhiên cấp THCS & THPT' WHERE username = 'teacher_mai';
UPDATE users SET energy_points = 2450, streak_days = 7, bio = 'Học sinh đam mê môn Toán và Lập trình' WHERE username = 'student_an';
UPDATE users SET energy_points = 1500, streak_days = 4, bio = 'Học sinh mới tham gia lớp học trực tuyến' WHERE username = 'hocsinh1';
