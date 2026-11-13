-- ==============================================================================
-- Flyway Migration V7: Bổ sung trường phản hồi đánh giá AI (RLHF Feedback)
-- ==============================================================================

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS feedback_rating VARCHAR(20);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS feedback_comment VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_chat_messages_feedback ON chat_messages(feedback_rating) WHERE feedback_rating IS NOT NULL;
