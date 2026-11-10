-- V6__database_tuning_indexes.sql
-- Production Index & Query Tuning for DMKLab Education Platform (PostgreSQL 17)

-- 1. Accelerate Quiz Loading by Lesson & Order
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_order ON quiz_questions(lesson_id, display_order);

-- 2. Accelerate AI Chat Session Retrieval by User & Type
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_type_created ON chat_sessions(user_id, session_type, created_at DESC);

-- 3. Case-Insensitive B-Tree Indexes for Instant SSO & Login Lookups
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username));

-- 4. Accelerate Parent-Student Cascade Relationship Lookups
CREATE INDEX IF NOT EXISTS idx_user_relations_parent_student ON user_relations(parent_id, student_id);
