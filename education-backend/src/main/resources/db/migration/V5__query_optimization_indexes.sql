-- V5__query_optimization_indexes.sql
-- Enterprise Database Query Optimization for DMKLab Education Platform (PostgreSQL 17)

-- 1. Accelerate Audit Log queries & sorting
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- 2. Accelerate Parent-Student Relationships
CREATE INDEX IF NOT EXISTS idx_user_relations_student ON user_relations(student_id);

-- 3. Accelerate Learning Progress & Analytics aggregations
CREATE INDEX IF NOT EXISTS idx_progress_lesson_completed ON learning_progress(lesson_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_progress_last_accessed ON learning_progress(user_id, last_accessed_at DESC);

-- 4. Accelerate AI Chat Session Message history lookup
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_time ON chat_messages(session_id, created_at ASC);

-- 5. Accelerate Student Gamification Leaderboard & Ranking lookups
CREATE INDEX IF NOT EXISTS idx_users_energy_points ON users(energy_points DESC);
CREATE INDEX IF NOT EXISTS idx_users_streak_days ON users(streak_days DESC);

-- 6. Accelerate Recent Published Lessons lookup
CREATE INDEX IF NOT EXISTS idx_lessons_published_created ON lessons(created_at DESC) WHERE is_published = TRUE;

