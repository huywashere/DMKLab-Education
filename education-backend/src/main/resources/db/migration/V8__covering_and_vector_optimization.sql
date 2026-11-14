-- ==============================================================================
-- Flyway Migration V8: Enterprise Covering Indexes & Query Execution Tuning
-- PostgreSQL 16 Index-Only Scans & Zero Table-Heap Access
-- ==============================================================================

-- 1. Index-Only Scan cho danh sách bài học theo môn học (Loại bỏ đọc Table Heap)
CREATE INDEX IF NOT EXISTS idx_lessons_subject_cover
ON lessons(subject_id, display_order)
INCLUDE (id, title, video_duration_seconds, thumbnail_url)
WHERE is_published = TRUE;

-- 2. Index-Only Scan cho tiến độ học tập và cấp độ tinh thông của học sinh
CREATE INDEX IF NOT EXISTS idx_progress_user_lesson_cover
ON learning_progress(user_id, lesson_id)
INCLUDE (position_seconds, is_completed, mastery_level, last_accessed_at);

-- 3. Index-Only Scan cho bộ câu hỏi trắc nghiệm kèm đáp án đúng
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_cover
ON quiz_questions(lesson_id, display_order)
INCLUDE (id, question, correct_answer);

-- 4. Index-Only Scan cho truy xuất lịch sử tin nhắn hội thoại Socratic AI
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_cover
ON chat_messages(session_id, created_at ASC)
INCLUDE (id, sender_role, tokens_used);

-- 5. Case-Insensitive Covering Index cho luồng xác thực đăng nhập & JWT Filter
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup
ON users(LOWER(email), is_active)
INCLUDE (id, password_hash, role, full_name);
