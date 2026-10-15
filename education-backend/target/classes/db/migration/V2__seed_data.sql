-- V2__seed_data.sql
-- Seed data for K-12 Online Education Platform

-- 1. Users (BCrypt password for "password123": $2a$10$xDOeSfV2URpqfXI/UZREW.xgCRiqLcYmH0zxYrJsRyE1Vn2mtYlJ.)
INSERT INTO users (id, username, email, password_hash, full_name, role, avatar_url, is_active)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@dmklab.edu.vn', '$2a$10$xDOeSfV2URpqfXI/UZREW.xgCRiqLcYmH0zxYrJsRyE1Vn2mtYlJ.', 'Quản Trị Viên Hệ Thống', 'ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', true),
('22222222-2222-2222-2222-222222222222', 'teacher_mai', 'mai.teacher@dmklab.edu.vn', '$2a$10$xDOeSfV2URpqfXI/UZREW.xgCRiqLcYmH0zxYrJsRyE1Vn2mtYlJ.', 'Cô Nguyễn Thị Mai', 'TEACHER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai', true),
('33333333-3333-3333-3333-333333333333', 'student_an', 'an.student@dmklab.edu.vn', '$2a$10$xDOeSfV2URpqfXI/UZREW.xgCRiqLcYmH0zxYrJsRyE1Vn2mtYlJ.', 'Trần Văn An', 'STUDENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=an', true);

-- 2. Grades (Khối 1 - 12)
INSERT INTO grades (id, name, code, level, display_order) VALUES
('a0000001-0000-0000-0000-000000000001', 'Lớp 1', 'GRADE_1', 'PRIMARY', 1),
('a0000002-0000-0000-0000-000000000002', 'Lớp 2', 'GRADE_2', 'PRIMARY', 2),
('a0000003-0000-0000-0000-000000000003', 'Lớp 3', 'GRADE_3', 'PRIMARY', 3),
('a0000004-0000-0000-0000-000000000004', 'Lớp 4', 'GRADE_4', 'PRIMARY', 4),
('a0000005-0000-0000-0000-000000000005', 'Lớp 5', 'GRADE_5', 'PRIMARY', 5),
('a0000006-0000-0000-0000-000000000006', 'Lớp 6', 'GRADE_6', 'SECONDARY', 6),
('a0000007-0000-0000-0000-000000000007', 'Lớp 7', 'GRADE_7', 'SECONDARY', 7),
('a0000008-0000-0000-0000-000000000008', 'Lớp 8', 'GRADE_8', 'SECONDARY', 8),
('a0000009-0000-0000-0000-000000000009', 'Lớp 9', 'GRADE_9', 'SECONDARY', 9),
('a0000010-0000-0000-0000-000000000010', 'Lớp 10', 'GRADE_10', 'HIGH_SCHOOL', 10),
('a0000011-0000-0000-0000-000000000011', 'Lớp 11', 'GRADE_11', 'HIGH_SCHOOL', 11),
('a0000012-0000-0000-0000-000000000012', 'Lớp 12', 'GRADE_12', 'HIGH_SCHOOL', 12);

-- 3. Subjects cho các khối tiêu biểu
-- Khối 1
INSERT INTO subjects (id, grade_id, name, code, color, icon, display_order) VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Toán Lớp 1', 'MATH_1', '#1865F2', 'calculator', 1),
('b0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Tiếng Việt Lớp 1', 'VIETNAMESE_1', '#E83E8C', 'book-open', 2),
('b0000003-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Tiếng Anh Tiểu Học', 'ENGLISH_1', '#28A745', 'globe', 3);

-- Khối 6
INSERT INTO subjects (id, grade_id, name, code, color, icon, display_order) VALUES
('b0000006-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000006', 'Toán Lớp 6 - Số học & Hình học', 'MATH_6', '#1865F2', 'calculator', 1),
('b0000006-0000-0000-0000-000000000002', 'a0000006-0000-0000-0000-000000000006', 'Khoa Học Tự Nhiên 6', 'SCIENCE_6', '#14BF96', 'flask-conical', 2),
('b0000006-0000-0000-0000-000000000003', 'a0000006-0000-0000-0000-000000000006', 'Ngữ Văn 6', 'LITERATURE_6', '#FD7E14', 'book-open', 3);

-- Khối 10
INSERT INTO subjects (id, grade_id, name, code, color, icon, display_order) VALUES
('b0000010-0000-0000-0000-000000000001', 'a0000010-0000-0000-0000-000000000010', 'Toán Học 10 - Đại Số & Hình Học', 'MATH_10', '#1865F2', 'compass', 1),
('b0000010-0000-0000-0000-000000000002', 'a0000010-0000-0000-0000-000000000010', 'Vật Lý 10 - Cơ Học Chuyển Động', 'PHYSICS_10', '#6F42C1', 'atom', 2),
('b0000010-0000-0000-0000-000000000003', 'a0000010-0000-0000-0000-000000000010', 'Hóa Học 10 - Cấu Tạo Nguyên Tử', 'CHEMISTRY_10', '#20C997', 'flask-conical', 3);

-- Khối 12
INSERT INTO subjects (id, grade_id, name, code, color, icon, display_order) VALUES
('b0000012-0000-0000-0000-000000000001', 'a0000012-0000-0000-0000-000000000012', 'Ôn Thi Đại Học: Toán 12', 'MATH_12', '#DC3545', 'graduation-cap', 1),
('b0000012-0000-0000-0000-000000000002', 'a0000012-0000-0000-0000-000000000012', 'Tiếng Anh 12 - Luyện Đề THPTQG', 'ENGLISH_12', '#1865F2', 'award', 2);

-- 4. Lessons cho Toán 10 và Toán 6
INSERT INTO lessons (id, subject_id, title, description, video_url, video_duration_seconds, thumbnail_url, display_order, is_published) VALUES
('c0000001-0000-0000-0000-000000000001', 'b0000010-0000-0000-0000-000000000001', 'Bài 1: Mệnh đề toán học & Mệnh đề chứa biến', 'Khái niệm mệnh đề, phủ định mệnh đề, mệnh đề kéo theo và tương đương.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 720, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600', 1, true),
('c0000001-0000-0000-0000-000000000002', 'b0000010-0000-0000-0000-000000000001', 'Bài 2: Tập hợp và các phép toán trên tập hợp', 'Tập hợp con, giao, hợp, hiệu và phần bù của tập hợp qua sơ đồ Venn.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 850, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600', 2, true),
('c0000001-0000-0000-0000-000000000003', 'b0000010-0000-0000-0000-000000000001', 'Bài 3: Bất phương trình bậc nhất hai ẩn', 'Biểu diễn miền nghiệm của bất phương trình trên mặt phẳng toạ độ.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 640, 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600', 3, true),

('c0000001-0000-0000-0000-000000000004', 'b0000006-0000-0000-0000-000000000001', 'Bài 1: Tập hợp các số tự nhiên - Phép cộng và trừ', 'Làm quen với tập hợp N, quy tắc cộng trừ số tự nhiên nhanh chóng.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600', 1, true),
('c0000001-0000-0000-0000-000000000005', 'b0000006-0000-0000-0000-000000000001', 'Bài 2: Lũy thừa với số mũ tự nhiên', 'Quy tắc nhân chia hai lũy thừa cùng cơ số và các bài toán thực tế.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 580, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600', 2, true);

-- 5. Quiz Questions cho Bài 1 (Mệnh đề toán học)
INSERT INTO quiz_questions (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, display_order) VALUES
('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Câu nào sau đây là một mệnh đề toán học?', 'Hôm nay trời đẹp quá!', 'Số 17 là số nguyên tố.', 'Bạn đang làm gì đấy?', 'x + 5 = 10', 'B', 'Mệnh đề toán học là khẳng định có tính đúng hoặc sai rõ ràng. "Số 17 là số nguyên tố" là mệnh đề đúng.', 1),
('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Phủ định của mệnh đề "Mọi hình vuông đều là hình chữ nhật" là gì?', 'Tất cả các hình vuông không phải là hình chữ nhật', 'Có ít nhất một hình vuông không phải là hình chữ nhật', 'Mọi hình chữ nhật đều là hình vuông', 'Hình vuông nào cũng là hình thoi', 'B', 'Phủ định của mệnh đề "Với mọi x thuộc X, P(x)" là "Tồn tại x thuộc X sao cho không P(x)".', 2),
('d0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Cho P: "Tam giác ABC cân" và Q: "Tam giác ABC đều". Mệnh đề nào sau đây đúng?', 'P kéo theo Q', 'Q kéo theo P', 'P tương đương Q', 'Cả P và Q đều sai', 'B', 'Tam giác đều luôn là tam giác cân, do đó Q suy ra P là đúng.', 3);
