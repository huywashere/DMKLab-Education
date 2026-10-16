-- V4__performance_indexes.sql
-- High-Performance Composite & Foreign Key Indexes for DMKLab Education

-- 1. Accelerate Grade, Subject and Lesson ordering lookups
CREATE INDEX IF NOT EXISTS idx_grades_display_order ON grades(display_order);
CREATE INDEX IF NOT EXISTS idx_subjects_grade_order ON subjects(grade_id, display_order);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_order ON lessons(subject_id, display_order);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published) WHERE is_published = TRUE;

-- 2. Accelerate Student Learning Progress and Completion filtering
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON learning_progress(user_id, is_completed);

-- 3. Accelerate Chat Sessions and User lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_time ON chat_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
