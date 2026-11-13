package com.example.learning.ai.service;

import com.example.learning.ai.dto.AiChatDto;
import com.example.learning.ai.entity.ChatMessage;
import com.example.learning.ai.entity.ChatSession;
import com.example.learning.ai.repository.ChatMessageRepository;
import com.example.learning.ai.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final com.example.learning.content.repository.LessonRepository lessonRepository;
    private final SystemKnowledgeCrawlerService knowledgeCrawler;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
    private final java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(10))
            .build();

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Value("${app.ai.provider:${AI_PROVIDER:gemini}}")
    private String aiProvider;

    @Value("${app.ai.gemini.api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:${GEMINI_MODEL:gemini-2.5-flash}}")
    private String geminiModel;

    @Value("${app.ai.groq.api-key:${GROQ_API_KEY:}}")
    private String groqApiKey;

    @Value("${app.ai.groq.model:${GROQ_MODEL:llama-3.3-70b-versatile}}")
    private String groqModel;

    @Value("${app.ai.groq.base-url:${GROQ_BASE_URL:https://api.groq.com/openai/v1}}")
    private String groqBaseUrl;

    @Value("${app.ai.openai.api-key:${OPENAI_API_KEY:}}")
    private String openAiApiKey;

    @Value("${app.ai.openai.model:${OPENAI_MODEL:gpt-4o-mini}}")
    private String openAiModel;

    @Value("${app.ai.openai.base-url:${OPENAI_BASE_URL:https://api.openai.com/v1}}")
    private String openAiBaseUrl;

    @Value("${app.ai.openai.student-daily-quota:30}")
    private int dailyQuota;

    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+84|0)(3|5|7|8|9)[0-9]{8}");
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("\\b[0-9]{9,12}\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern INJECTION_PATTERN = Pattern.compile("(?i)(ignore previous instructions|bỏ qua hướng dẫn|bỏ qua quy tắc|jailbreak|DAN mode|system prompt|hack hệ thống|đưa luôn đáp án không cần giải thích|bypass filter)");

    @Transactional
    public AiChatDto.ChatResponse processLearningChat(UUID userId, AiChatDto.ChatRequest req) {
        // 1. Quota check (PDF Section 9.1 & 14.1)
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        long usedToday = messageRepository.countUserMessagesSince(userId, startOfDay);
        if (usedToday >= dailyQuota) {
            throw new RuntimeException("Bạn đã dùng hết hạn mức " + dailyQuota + " câu hỏi trợ lý AI trong ngày. Hạn mức sẽ tự động đặt lại vào ngày mai!");
        }

        // 2. Bảo vệ dữ liệu học sinh & Kiểm duyệt nội dung K-12
        String rawMessage = req.getMessage() != null ? req.getMessage().trim() : "";
        String safetyWarning = detectPiiAndHarmfulContent(rawMessage);

        // 3. Find or create ChatSession
        ChatSession session;
        if (req.getSessionId() != null) {
            session = sessionRepository.findById(req.getSessionId())
                    .orElseGet(() -> createSession(userId, "LEARNING", req.getContextLessonTitle()));
        } else {
            session = sessionRepository.findFirstByUserIdAndSessionTypeOrderByCreatedAtDesc(userId, "LEARNING")
                    .orElseGet(() -> createSession(userId, "LEARNING", req.getContextLessonTitle()));
        }

        // 4. Save User message
        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(session.getId())
                .senderRole("USER")
                .content(rawMessage)
                .tokensUsed(rawMessage.length() / 4)
                .build();
        messageRepository.save(userMsg);

        // 5. Trích xuất dữ liệu chuyên sâu từ bài học (Lesson Content) nếu có lessonId
        String effectiveKnowledge = req.getCustomKnowledge();
        String lessonTitle = req.getContextLessonTitle();
        String subject = req.getContextSubject();

        if (req.getLessonId() != null) {
            try {
                var lessonOpt = lessonRepository.findById(req.getLessonId());
                if (lessonOpt.isPresent()) {
                    var lesson = lessonOpt.get();
                    if (lessonTitle == null || lessonTitle.isBlank()) {
                        lessonTitle = lesson.getTitle();
                    }
                    if (lesson.getSubject() != null && (subject == null || subject.isBlank())) {
                        subject = lesson.getSubject().getName();
                    }
                    if (lesson.getDescription() != null && !lesson.getDescription().isBlank()) {
                        String lessonDesc = "Tài liệu bài học '" + lesson.getTitle() + "': " + lesson.getDescription();
                        effectiveKnowledge = (effectiveKnowledge != null && !effectiveKnowledge.isBlank())
                                ? effectiveKnowledge + "\n\n" + lessonDesc
                                : lessonDesc;
                    }
                }
            } catch (Exception ex) {
                log.warn("[AI_KNOWLEDGE_RESOLVE_WARN] Không thể nạp dữ liệu bài học {}: {}", req.getLessonId(), ex.getMessage());
            }
        }

        // 6. Generate Advanced AI Tutor Response (với In-Context Grounding & Multi-Turn Context Memory)
        String mode = req.getMode() != null ? req.getMode().toUpperCase() : "SOCRATIC";
        int gradeLevel = req.getGradeLevel() != null ? req.getGradeLevel() : 5;

        // Crawl tri thức hệ thống & kiểm tra rào cản bảo vệ chủ đề (System Crawler & Topic Guardrail)
        SystemKnowledgeCrawlerService.KnowledgeCrawlResult crawlResult = knowledgeCrawler.crawlAndGroundKnowledge(
                rawMessage, gradeLevel, subject, lessonTitle, effectiveKnowledge
        );

        TutorOutput output = generateTutorResponse(
                session.getId(),
                mode,
                gradeLevel,
                rawMessage,
                lessonTitle,
                subject,
                req.getStudentAnswer(),
                crawlResult.getGroundedPromptKnowledge(),
                crawlResult
        );

        // 7. Save Assistant response
        ChatMessage assistantMsg = ChatMessage.builder()
                .sessionId(session.getId())
                .senderRole("ASSISTANT")
                .content(output.reply)
                .tokensUsed(output.reply.length() / 4)
                .build();
        assistantMsg = messageRepository.save(assistantMsg);

        int remaining = Math.max(0, (int) (dailyQuota - (usedToday + 1)));

        return AiChatDto.ChatResponse.builder()
                .sessionId(session.getId())
                .messageId(assistantMsg.getId())
                .reply(output.reply)
                .isSocraticHint(true)
                .mode(mode)
                .gradeLevel(gradeLevel)
                .stepByStepHints(output.stepByStepHints)
                .interactiveQuiz(output.interactiveQuiz)
                .citations(output.citations)
                .misconceptionReason(output.misconceptionReason)
                .safetyWarning(safetyWarning)
                .quickReplies(output.quickReplies)
                .dailyQuotaRemaining(remaining)
                .timestamp(Instant.now())
                .build();
    }

    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamLearningChat(
            UUID userId, AiChatDto.ChatRequest req) {
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = 
                new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(60000L);

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                AiChatDto.ChatResponse resp = processLearningChat(userId, req);
                String fullText = resp.getReply() != null ? resp.getReply() : "";
                String[] words = fullText.split(" ");
                for (int i = 0; i < words.length; i++) {
                    String piece = words[i] + (i < words.length - 1 ? " " : "");
                    emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                            .name("token")
                            .data(piece));
                    Thread.sleep(25); // 25ms typing delay for smooth Socratic delivery
                }
                emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                        .name("done")
                        .data(resp));
                emitter.complete();
            } catch (Exception ex) {
                try {
                    emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                            .name("error")
                            .data(ex.getMessage()));
                } catch (Exception ignored) {}
                emitter.completeWithError(ex);
            }
        });

        return emitter;
    }

    @Transactional
    public AiChatDto.ChatResponse processAdminChat(UUID userId, AiChatDto.ChatRequest req) {
        ChatSession session = sessionRepository.findFirstByUserIdAndSessionTypeOrderByCreatedAtDesc(userId, "ADMIN")
                .orElseGet(() -> createSession(userId, "ADMIN", "Tra cứu quản trị"));

        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(session.getId())
                .senderRole("USER")
                .content(req.getMessage())
                .tokensUsed(req.getMessage().length() / 4)
                .build();
        messageRepository.save(userMsg);

        String reply = generateAdminGuidanceResponse(req.getMessage());

        ChatMessage assistantMsg = ChatMessage.builder()
                .sessionId(session.getId())
                .senderRole("ASSISTANT")
                .content(reply)
                .tokensUsed(reply.length() / 4)
                .build();
        messageRepository.save(assistantMsg);

        return AiChatDto.ChatResponse.builder()
                .sessionId(session.getId())
                .reply(reply)
                .isSocraticHint(false)
                .dailyQuotaRemaining(999)
                .timestamp(Instant.now())
                .build();
    }

    public List<AiChatDto.MessageItem> getSessionHistory(UUID sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(m -> AiChatDto.MessageItem.builder()
                        .id(m.getId())
                        .senderRole(m.getSenderRole())
                        .content(m.getContent())
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public boolean recordMessageFeedback(UUID messageId, String rating, String comment) {
        return messageRepository.findById(messageId).map(msg -> {
            msg.setFeedbackRating(rating);
            msg.setFeedbackComment(comment);
            messageRepository.save(msg);
            log.info("[AI_RLHF_FEEDBACK] Đã ghi nhận phản hồi {} cho tin nhắn {}", rating, messageId);
            return true;
        }).orElse(false);
    }

    private ChatSession createSession(UUID userId, String type, String title) {
        return sessionRepository.save(ChatSession.builder()
                .userId(userId)
                .sessionType(type)
                .title(title != null ? title : ("Phiên học " + type))
                .build());
    }

    /**
     * Kiểm tra và bảo vệ dữ liệu học sinh (PII Detection & Safety Filter)
     */
    private String detectPiiAndHarmfulContent(String message) {
        if (PHONE_PATTERN.matcher(message).find()) {
            return "Hệ thống bảo vệ dữ liệu học sinh: Phát hiện số điện thoại trong tin nhắn! Vui lòng không chia sẻ số điện thoại cá nhân trên môi trường học trực tuyến.";
        }
        if (ID_CARD_PATTERN.matcher(message).find()) {
            return "Hệ thống bảo vệ dữ liệu học sinh: Phát hiện dãy số định danh/CCCD! Để bảo vệ quyền riêng tư, tuyệt đối không chia sẻ thông tin căn cước.";
        }
        if (EMAIL_PATTERN.matcher(message).find()) {
            return "Hệ thống bảo mật: Vui lòng không gửi địa chỉ email cá nhân vào khung trò chuyện.";
        }
        if (INJECTION_PATTERN.matcher(message).find()) {
            return "Cảnh báo an toàn AI: Phát hiện câu lệnh bất thường (Prompt Injection/Jailbreak). Gia sư AI tuân thủ nghiêm ngặt chuẩn sư phạm K-12 và không bỏ qua nguyên tắc giảng dạy!";
        }
        return null;
    }

    private static class TutorOutput {
        String reply;
        List<String> stepByStepHints = new ArrayList<>();
        AiChatDto.InteractiveQuizDto interactiveQuiz;
        List<AiChatDto.CitationDto> citations = new ArrayList<>();
        String misconceptionReason;
        List<String> quickReplies = new ArrayList<>();
    }

    /**
     * Bộ máy sư phạm AI Tutor đa chế độ với Trí nhớ Ngữ cảnh Nhiều lượt (Multi-turn Context Memory):
     * 1. Giải thích bài học theo trình độ lớp (Lớp 1-5, 6-9, 10-12)
     * 2. Gợi ý từng bước thay vì chỉ đưa đáp án (Socratic)
     * 3. Tạo câu hỏi luyện tập tương tác
     * 4. Giải thích vì sao câu trả lời sai (Misconception Diagnosis)
     * 5. Trích dẫn bài học hoặc tài liệu SGK làm căn cứ
     */
    private TutorOutput generateTutorResponse(
            UUID sessionId,
            String mode,
            int gradeLevel,
            String message,
            String lessonTitle,
            String subject,
            String studentAnswer,
            String customKnowledge,
            SystemKnowledgeCrawlerService.KnowledgeCrawlResult crawlResult) {
        TutorOutput out = new TutorOutput();
        String qLower = message.toLowerCase();
        String context = lessonTitle != null ? lessonTitle : "Toán học K-12";
        String subj = subject != null ? subject : "Toán học";

        // Gợi ý phản hồi nhanh thông minh 1 chạm (Quick Reply Action Chips)
        out.quickReplies.add("💡 Thầy gợi ý bước tiếp theo giúp em");
        out.quickReplies.add("🔍 Em chưa rõ đoạn này, thầy giải thích kỹ hơn");
        out.quickReplies.add("📝 Cho em một bài tập tương tự để luyện");
        out.quickReplies.add("✨ Em đã hiểu rồi, cảm ơn thầy!");

        // Gắn trích dẫn SGK: Ưu tiên tài liệu SGK chuẩn đã được crawl từ hệ thống
        if (crawlResult != null && crawlResult.getCitations() != null && !crawlResult.getCitations().isEmpty()) {
            out.citations.addAll(crawlResult.getCitations());
        } else {
            addStandardCitations(out, gradeLevel, context);
        }

        // Xử lý rào cản bảo vệ chủ đề nếu câu hỏi bị xác định là lạc đề / phi học thuật
        if (crawlResult != null && !crawlResult.isOnTopic()) {
            out.misconceptionReason = "OFF_TOPIC_REDIRECT";
            out.quickReplies.clear();
            out.quickReplies.add("📖 Trở lại bài học: " + context);
            out.quickReplies.add("💡 Cho em xem công thức SGK trọng tâm");
            out.quickReplies.add("📝 Thử một câu hỏi luyện tập");
            out.quickReplies.add("✨ Em đã sẵn sàng tiếp tục!");
        }

        // Truy xuất lịch sử hội thoại gần nhất (tối đa 6 tin nhắn trước đó) để duy trì trí nhớ liên tục (Multi-turn Memory)
        List<ChatMessage> recentHistory = new ArrayList<>();
        if (sessionId != null) {
            try {
                List<ChatMessage> fullHistory = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
                int sz = fullHistory.size();
                if (sz > 1) {
                    recentHistory = fullHistory.subList(Math.max(0, sz - 7), sz - 1);
                }
            } catch (Exception ex) {
                log.warn("[AI_HISTORY_WARN] Không thể tải lịch sử hội thoại: {}", ex.getMessage());
            }
        }

        // 0. Kiểm tra Semantic Cache trong Redis (Nếu là tài liệu chuẩn, trả về ngay 0ms, 0đ token)
        String cacheKey = (customKnowledge == null || customKnowledge.isBlank())
                ? buildCacheKey(gradeLevel, mode, subj, context, message)
                : null;

        if (cacheKey != null && redisTemplate != null) {
            try {
                String cachedReply = redisTemplate.opsForValue().get(cacheKey);
                if (cachedReply != null && !cachedReply.isBlank()) {
                    log.info("[AI_CACHE_HIT] Phản hồi tức thì từ Redis Cache (0ms, 0đ token) cho câu hỏi: {}", message);
                    out.reply = cachedReply;
                    out.stepByStepHints.add("Gợi ý 1: Đọc kỹ câu hỏi và xác định rõ yêu cầu bài toán.");
                    out.stepByStepHints.add("Gợi ý 2: Áp dụng định nghĩa và tính chất cơ bản đã học trong bài '" + context + "'.");
                    out.stepByStepHints.add("Gợi ý 3: Tự nhẩm thử hoặc vẽ hình trực quan để kiểm tra kết quả.");
                    return out;
                }
            } catch (Exception ex) {
                log.warn("[AI_CACHE_WARN] Lỗi đọc Redis Cache: {}", ex.getMessage());
            }
        }

        // 1. Thử gọi mô hình AI ưu tiên (Groq Cloud -> Gemini -> OpenAI -> Fallback Socratic nội bộ) kèm Multi-turn Context
        String liveReply = null;
        if ("groq".equalsIgnoreCase(aiProvider) || (groqApiKey != null && groqApiKey.startsWith("gsk_"))) {
            liveReply = callGroqLiveTutor(recentHistory, mode, gradeLevel, message, context, subj, studentAnswer, customKnowledge);
        }

        if (liveReply == null && ("openai".equalsIgnoreCase(aiProvider))) {
            liveReply = callOpenAiLiveTutor(recentHistory, mode, gradeLevel, message, context, subj, studentAnswer, customKnowledge);
            if (liveReply == null) {
                // Fallback sang Gemini
                liveReply = callGeminiLiveTutor(recentHistory, mode, gradeLevel, message, context, subj, studentAnswer, customKnowledge);
            }
        } else if (liveReply == null) {
            // Mặc định ưu tiên Gemini (vì đang hoạt động 200 OK với quota lớn)
            liveReply = callGeminiLiveTutor(recentHistory, mode, gradeLevel, message, context, subj, studentAnswer, customKnowledge);
            if (liveReply == null) {
                // Fallback sang Groq nếu chưa gọi
                liveReply = callGroqLiveTutor(recentHistory, mode, gradeLevel, message, context, subj, studentAnswer, customKnowledge);
            }
            if (liveReply == null) {
                // Fallback sang OpenAI
                liveReply = callOpenAiLiveTutor(recentHistory, mode, gradeLevel, message, context, subj, studentAnswer, customKnowledge);
            }
        }

        if (liveReply != null && !liveReply.isBlank()) {
            out.reply = liveReply;
            out.stepByStepHints.add("Gợi ý 1: Đọc kỹ câu hỏi và xác định rõ yêu cầu bài toán.");
            out.stepByStepHints.add("Gợi ý 2: Áp dụng định nghĩa và tính chất cơ bản đã học trong bài '" + context + "'.");
            out.stepByStepHints.add("Gợi ý 3: Tự nhẩm thử hoặc vẽ hình trực quan để kiểm tra kết quả.");

            // Lưu bộ đệm Redis Semantic Cache (TTL 24 giờ) để tái sử dụng cho các học sinh khác
            if (cacheKey != null && redisTemplate != null) {
                try {
                    redisTemplate.opsForValue().set(cacheKey, liveReply, java.time.Duration.ofHours(24));
                } catch (Exception ex) {
                    log.warn("[AI_CACHE_WARN] Không thể ghi cache Redis: {}", ex.getMessage());
                }
            }

            return out;
        }

        // 2. Fallback nội bộ theo quy tắc nếu chưa có mạng hoặc lỗi API
        if (crawlResult != null && !crawlResult.isOnTopic() && crawlResult.getOffTopicRedirectAdvice() != null) {
            out.reply = crawlResult.getOffTopicRedirectAdvice();
            out.stepByStepHints.add("Bước 1: Tập trung vào mục tiêu bài học: " + context);
            out.stepByStepHints.add("Bước 2: Xem lại các định nghĩa và công thức cơ bản trong SGK.");
            out.stepByStepHints.add("Bước 3: Đặt câu hỏi cho thầy về phần em chưa hiểu trong bài nhé.");
            return out;
        }

        switch (mode) {
            case "GRADE_ADAPTED":
                handleGradeAdaptedMode(out, gradeLevel, qLower, context);
                break;

            case "PRACTICE":
                handlePracticeMode(out, gradeLevel, qLower, context);
                break;

            case "ERROR_DIAGNOSIS":
                handleErrorDiagnosisMode(out, gradeLevel, qLower, studentAnswer, context);
                break;

            case "CITE_LESSON":
                handleCitationMode(out, gradeLevel, qLower, context);
                break;

            case "SOCRATIC":
            default:
                handleSocraticMode(out, gradeLevel, qLower, context);
                break;
        }

        return out;
    }

    private String buildCacheKey(int gradeLevel, String mode, String subject, String context, String message) {
        String raw = (gradeLevel + ":" + mode + ":" + subject + ":" + context + ":" + message.trim().toLowerCase()).replaceAll("\\s+", " ");
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return "cache:ai:socratic:" + hex.substring(0, 32);
        } catch (Exception e) {
            return "cache:ai:socratic:" + Math.abs(raw.hashCode());
        }
    }

    /**
     * Tạo System Prompt chuẩn hóa cho Socratic Tutor kèm dữ liệu học tập đã upload (In-Context Grounding)
     * Thiết kế theo phương pháp sư phạm của Khanmigo (Khan Academy) và Brilliant.org
     */
    private String buildSocraticSystemPrompt(int gradeLevel, String subject, String context, String mode, String customKnowledge) {
        StringBuilder sb = new StringBuilder();

        // 1. Phân hóa phong cách sư phạm theo lứa tuổi K-12
        String persona;
        if (gradeLevel <= 5) {
            persona = "Bạn là thầy/cô giáo tiểu học hiền từ, vui vẻ của DMKLab Education. Xưng 'thầy/cô' và gọi học sinh là 'con'. Hãy dùng ví dụ trực quan như cái kẹo, quả táo, que tính, đồng hồ để con dễ hình dung.";
        } else if (gradeLevel <= 9) {
            persona = "Bạn là giáo viên THCS giàu kinh nghiệm của DMKLab Education. Xưng 'thầy/cô' và gọi học sinh là 'em'. Dẫn dắt em từng bước logic, khơi gợi tư duy phản biện và liên hệ thực tế.";
        } else {
            persona = "Bạn là chuyên gia sư phạm THPT của DMKLab Education. Xưng 'thầy/cô' và gọi học sinh là 'em'. Dẫn dắt tư duy hệ thống, phân tích bản chất định lý và liên hệ dạng bài thi tốt nghiệp THPT/Đại học.";
        }

        sb.append(persona).append("\n\n")
          .append(String.format("BỐI CẢNH HỌC TẬP: Lớp %d, Môn: %s, Bài học: '%s', Chế độ: '%s'.\n\n", gradeLevel, subject, context, mode))
          .append("QUY TẮC SƯ PHẠM SOCRATIC KHẮT KHE (KHANMIGO & HARVARD STANDARD):\n")
          .append("1. TUYỆT ĐỐI KHÔNG giải hộ hay đưa luôn đáp số cuối cùng cho học sinh, ngay cả khi học sinh nài nỉ.\n")
          .append("2. NGUYÊN TẮC 'MỘT BƯỚC MỖI LẦN' (ONE STEP AT A TIME): Chỉ đặt đúng 01 câu hỏi gợi mở tiếp theo ở cuối câu trả lời để học sinh tự suy nghĩ và phản hồi, không đặt dồn dập nhiều câu hỏi.\n")
          .append("3. CHẨN ĐOÁN ĐIỂM NGỘ NHẬN (MISCONCEPTION DIAGNOSIS): Nếu học sinh tính sai hoặc chọn sai đáp án, đừng chỉ nói 'Sai rồi'. Hãy chỉ ra chính xác điểm em đang nhầm lẫn (ví dụ: nhầm giữa dấu âm trong ngoặc và ngoài ngoặc, nhầm giữa cộng và nhân lũy thừa).\n")
          .append("4. ĐỊNH DẠNG TOÁN HỌC CHUẨN LATEX (KATEX): Toàn bộ công thức toán, biến số và phân số PHẢI được bọc trong cặp dấu $...$ (ví dụ: $x^2 - 4 = 0$, $\\frac{1}{2}$, $\\sqrt{3}$) để giao diện web hiển thị công thức sắc nét.\n")
          .append("5. KHÍCH LỆ TÍCH CỰC: Luôn ghi nhận nỗ lực suy nghĩ của học sinh trước khi chỉ ra chỗ cần điều chỉnh.\n")
          .append("6. QUY TẮC BẢO VỆ CHỦ ĐỀ & TRẢ LỜI ĐÚNG TRỌNG TÂM (TOPIC GUARDRAIL & ZERO-HALLUCINATION):\n")
          .append("   - Bạn là Gia sư chuyên trách môn '").append(subject).append("' và bài học '").append(context).append("'.\n")
          .append("   - Bám sát 100% tài liệu SGK/giáo trình hệ thống trích xuất bên dưới. Sử dụng đúng định nghĩa, định lý và công thức LaTeX chuẩn. Tuyệt đối không bịa đặt kiến thức ngoài chương trình GDPT 2018.\n")
          .append("   - NẾU HỌC SINH HỎI LẠC ĐỀ (game, giải trí, việc riêng, câu hỏi phi học thuật...): Tuyệt đối KHÔNG bàn luận lan man theo câu hỏi lạc đề. Hãy nhẹ nhàng nhắc nhở em quay lại trọng tâm bài học và đặt 01 câu hỏi gợi mở của bài học để khơi gợi tư duy.");

        if (customKnowledge != null && !customKnowledge.isBlank()) {
            sb.append("\n\n[TÀI LIỆU SGK & DỮ LIỆU CỐT LÕI CRAWL TỰ ĐỘNG TỪ HỆ THỐNG]:\n")
              .append(customKnowledge.trim())
              .append("\n\nYÊU CẦU HUẤN LUYỆN CHUYÊN BIỆT (IN-CONTEXT GROUNDING):\n")
              .append("1. Bạn PHẢI bám sát 100% dữ liệu giáo trình và công thức trích xuất ở trên để dẫn dắt học sinh.\n")
              .append("2. Trích dẫn đúng định nghĩa, định lý và công thức LaTeX chuẩn xác từ tài liệu.\n")
              .append("3. Tuyệt đối KHÔNG bịa đặt kiến thức ngoài tài liệu bài giảng đã nạp.");
        }

        return sb.toString();
    }

    /**
     * Gọi Google Gemini 2.5 Flash API để tạo câu trả lời sư phạm Socratic K-12
     */
    private String callGeminiLiveTutor(List<ChatMessage> recentHistory, String mode, int gradeLevel, String message, String context, String subject, String studentAnswer, String customKnowledge) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || "mock-key".equalsIgnoreCase(geminiApiKey)) {
            return null;
        }

        try {
            String systemPrompt = buildSocraticSystemPrompt(gradeLevel, subject, context, mode, customKnowledge);

            String userPrompt = message;
            if (studentAnswer != null && !studentAnswer.isBlank()) {
                userPrompt += " (Câu trả lời học sinh đã chọn: " + studentAnswer + ")";
            }

            String targetModel = (geminiModel != null && !geminiModel.isBlank()) ? geminiModel : "gemini-2.5-flash";
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + targetModel + ":generateContent?key=" + geminiApiKey;

            java.util.Map<String, Object> sysPart = java.util.Map.of("text", systemPrompt);
            java.util.Map<String, Object> sysInstruction = java.util.Map.of("parts", java.util.List.of(sysPart));

            // Xây dựng danh sách contents chứa toàn bộ lịch sử trò chuyện (Multi-turn Conversation)
            List<java.util.Map<String, Object>> contentsList = new ArrayList<>();
            if (recentHistory != null) {
                for (ChatMessage m : recentHistory) {
                    if (m.getContent() != null && !m.getContent().isBlank()) {
                        String role = "USER".equalsIgnoreCase(m.getSenderRole()) ? "user" : "model";
                        contentsList.add(java.util.Map.of(
                            "role", role,
                            "parts", java.util.List.of(java.util.Map.of("text", m.getContent()))
                        ));
                    }
                }
            }
            contentsList.add(java.util.Map.of(
                "role", "user",
                "parts", java.util.List.of(java.util.Map.of("text", userPrompt))
            ));

            java.util.Map<String, Object> genConfig = java.util.Map.of(
                "temperature", 0.6,
                "maxOutputTokens", 800
            );

            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("system_instruction", sysInstruction);
            body.put("contents", contentsList);
            body.put("generationConfig", genConfig);

            String jsonPayload = objectMapper.writeValueAsString(body);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .timeout(java.time.Duration.ofSeconds(12))
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(response.body());
                com.fasterxml.jackson.databind.JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    com.fasterxml.jackson.databind.JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        String reply = parts.get(0).path("text").asText();
                        if (reply != null && !reply.isBlank()) {
                            log.info("[GEMINI_LIVE_OK] Phản hồi thành công từ Google Gemini ({})", targetModel);
                            return reply.trim();
                        }
                    }
                }
            } else {
                log.warn("[GEMINI_LIVE_WARN] Google Gemini API trả về mã lỗi HTTP {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception ex) {
            log.warn("[GEMINI_LIVE_FALLBACK] Lỗi gọi Gemini API (Kích hoạt luật Socratic nội bộ): {}", ex.getMessage());
        }

        return null;
    }

    /**
     * Gọi OpenAI ChatGPT API (gpt-4o-mini) với cơ chế an toàn và tương thích
     */
    private String callOpenAiLiveTutor(List<ChatMessage> recentHistory, String mode, int gradeLevel, String message, String context, String subject, String studentAnswer, String customKnowledge) {
        if (openAiApiKey == null || openAiApiKey.isBlank() || "mock-key".equalsIgnoreCase(openAiApiKey)) {
            return null;
        }

        try {
            String systemPrompt = buildSocraticSystemPrompt(gradeLevel, subject, context, mode, customKnowledge);

            String userPrompt = message;
            if (studentAnswer != null && !studentAnswer.isBlank()) {
                userPrompt += " (Câu trả lời học sinh đã chọn: " + studentAnswer + ")";
            }

            String baseUrl = (openAiBaseUrl != null && !openAiBaseUrl.isBlank()) ? openAiBaseUrl.replaceAll("/+$", "") : "https://api.openai.com/v1";
            String endpoint = baseUrl + "/chat/completions";
            String targetModel = (openAiModel != null && !openAiModel.isBlank()) ? openAiModel : "gpt-4o-mini";

            List<java.util.Map<String, Object>> messagesList = new ArrayList<>();
            messagesList.add(java.util.Map.of("role", "system", "content", systemPrompt));
            if (recentHistory != null) {
                for (ChatMessage m : recentHistory) {
                    if (m.getContent() != null && !m.getContent().isBlank()) {
                        String role = "USER".equalsIgnoreCase(m.getSenderRole()) ? "user" : "assistant";
                        messagesList.add(java.util.Map.of("role", role, "content", m.getContent()));
                    }
                }
            }
            messagesList.add(java.util.Map.of("role", "user", "content", userPrompt));

            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("model", targetModel);
            body.put("messages", messagesList);
            body.put("temperature", 0.6);
            body.put("max_tokens", 800);

            String jsonPayload = objectMapper.writeValueAsString(body);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .timeout(java.time.Duration.ofSeconds(12))
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(response.body());
                com.fasterxml.jackson.databind.JsonNode choices = root.path("choices");
                if (choices.isArray() && !choices.isEmpty()) {
                    String reply = choices.get(0).path("message").path("content").asText();
                    if (reply != null && !reply.isBlank()) {
                        log.info("[OPENAI_LIVE_OK] Phản hồi thành công từ OpenAI ChatGPT ({})", targetModel);
                        return reply.trim();
                    }
                }
            } else {
                log.warn("[OPENAI_LIVE_WARN] OpenAI API trả về mã lỗi HTTP {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception ex) {
            log.warn("[OPENAI_LIVE_FALLBACK] Lỗi gọi OpenAI API: {}", ex.getMessage());
        }

        return null;
    }

    /**
     * Gọi Groq Cloud API (LPU Inference siêu tốc - OpenAI Compatible)
     * Hỗ trợ các Open Models hàng đầu: llama-3.3-70b-versatile, deepseek-r1-distill-llama-70b, qwen-2.5-32b
     */
    private String callGroqLiveTutor(List<ChatMessage> recentHistory, String mode, int gradeLevel, String message, String context, String subject, String studentAnswer, String customKnowledge) {
        if (groqApiKey == null || groqApiKey.isBlank() || "mock-key".equalsIgnoreCase(groqApiKey)) {
            return null;
        }

        try {
            String systemPrompt = buildSocraticSystemPrompt(gradeLevel, subject, context, mode, customKnowledge);

            String userPrompt = message;
            if (studentAnswer != null && !studentAnswer.isBlank()) {
                userPrompt += " (Câu trả lời học sinh đã chọn: " + studentAnswer + ")";
            }

            String baseUrl = (groqBaseUrl != null && !groqBaseUrl.isBlank()) ? groqBaseUrl.replaceAll("/+$", "") : "https://api.groq.com/openai/v1";
            String endpoint = baseUrl + "/chat/completions";
            String targetModel = (groqModel != null && !groqModel.isBlank()) ? groqModel : "llama-3.3-70b-versatile";

            List<java.util.Map<String, Object>> messagesList = new ArrayList<>();
            messagesList.add(java.util.Map.of("role", "system", "content", systemPrompt));
            if (recentHistory != null) {
                for (ChatMessage m : recentHistory) {
                    if (m.getContent() != null && !m.getContent().isBlank()) {
                        String role = "USER".equalsIgnoreCase(m.getSenderRole()) ? "user" : "assistant";
                        messagesList.add(java.util.Map.of("role", role, "content", m.getContent()));
                    }
                }
            }
            messagesList.add(java.util.Map.of("role", "user", "content", userPrompt));

            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("model", targetModel);
            body.put("messages", messagesList);
            body.put("temperature", 0.6);
            body.put("max_tokens", 800);

            String jsonPayload = objectMapper.writeValueAsString(body);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .timeout(java.time.Duration.ofSeconds(10))
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(response.body());
                com.fasterxml.jackson.databind.JsonNode choices = root.path("choices");
                if (choices.isArray() && !choices.isEmpty()) {
                    String reply = choices.get(0).path("message").path("content").asText();
                    if (reply != null && !reply.isBlank()) {
                        log.info("[GROQ_LIVE_OK] Phản hồi thành công từ Groq Cloud API ({})", targetModel);
                        return reply.trim();
                    }
                }
            } else {
                log.warn("[GROQ_LIVE_WARN] Groq API trả về mã lỗi HTTP {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception ex) {
            log.warn("[GROQ_LIVE_FALLBACK] Lỗi gọi Groq API: {}", ex.getMessage());
        }

        return null;
    }

    private void handleGradeAdaptedMode(TutorOutput out, int gradeLevel, String q, String context) {
        if (gradeLevel <= 5) {
            // Tiểu học: Ngôn ngữ trực quan, hình tượng quả cam, bánh pizza, que tính
            out.reply = "Chào em! Ở cấp Tiểu học (Lớp " + gradeLevel + "), chúng ta cùng hình dung một cách thật trực quan nhé: "
                    + "Hãy tưởng tượng em có một chiếc bánh pizza thơm ngon được mẹ chia đều làm 4 phần bằng nhau. "
                    + "Nếu em ăn 1 miếng bánh, thì em đã ăn 1/4 chiếc bánh (1 là tử số - số miếng em ăn, 4 là mẫu số - tổng số miếng mẹ chia). "
                    + "Quy tắc vàng cho học sinh Lớp " + gradeLevel + ": Tử số ở trên là phần em lấy, Mẫu số ở dưới là tổng số phần bằng nhau.";
            out.stepByStepHints.add("Bước 1: Đếm xem chiếc bánh hoặc đồ vật được chia làm bao nhiêu phần bằng nhau (đây là Mẫu số).");
            out.stepByStepHints.add("Bước 2: Đếm số phần được lấy ra hoặc tô màu (đây là Tử số).");
            out.stepByStepHints.add("Bước 3: Viết phân số: Tử số ở trên, dấu gạch ngang ở giữa, Mẫu số ở dưới.");
        } else if (gradeLevel <= 9) {
            // THCS: Logic, quy tắc biến đổi, mẫu số chung nhỏ nhất
            out.reply = "Chào bạn! Ở cấp THCS (Lớp " + gradeLevel + "), ta tiếp cận kiến thức dưới góc độ đại số và tính chất tổng quát: "
                    + "Phân số a/b (với b ≠ 0) biểu diễn thương của phép chia số nguyên a cho số nguyên b. "
                    + "Khi quy đồng hoặc cộng trừ phân số, ta cần tìm Bội chung nhỏ nhất (BCNN) của các mẫu số để làm Mẫu số chung. "
                    + "Ví dụ với 2/3 và 3/4: BCNN(3, 4) = 12. Ta nhân cả tử và mẫu của 2/3 với 4, và 3/4 với 3.";
            out.stepByStepHints.add("Bước 1: Phân tích các mẫu số ra thừa số nguyên tố.");
            out.stepByStepHints.add("Bước 2: Tìm Mẫu thức chung = BCNN của các mẫu số.");
            out.stepByStepHints.add("Bước 3: Tìm nhân tử phụ tương ứng cho từng phân số rồi quy đồng.");
        } else {
            // THPT: Bản chất toán học, tập số, hàm số, liên hệ thực tiễn và thi THPT Quốc gia
            out.reply = "Chào bạn! Ở bậc THPT (Lớp " + gradeLevel + "), chúng ta nghiên cứu bài học theo tinh thần bản chất giải tích và đại số hiện đại: "
                    + "Khái niệm này mở rộng từ trường số hữu tỉ Q sang trường số thực R, liên quan chặt chẽ đến tính liên tục, hàm phân thức và giới hạn lim khi biến số tiến tới vô cực. "
                    + "Trong các đề thi tốt nghiệp THPT, dạng bài này thường xuất hiện dưới dạng tìm tiệm cận hoặc bài toán ứng dụng thực tế tối ưu hóa.";
            out.stepByStepHints.add("Bước 1: Thiết lập tập xác định (ĐKXĐ: mẫu số khác 0, biểu thức dưới căn ≥ 0).");
            out.stepByStepHints.add("Bước 2: Áp dụng định lý biến đổi đại số / đạo hàm / giới hạn.");
            out.stepByStepHints.add("Bước 3: Đối chiếu điều kiện ban đầu để kết luận tập nghiệm chính xác.");
        }
    }

    /**
     * Chế độ 2: Gợi ý từng bước thay vì chỉ đưa đáp án (Socratic)
     */
    private void handleSocraticMode(TutorOutput out, int gradeLevel, String q, String context) {
        if (q.contains("đáp án") || q.contains("kết quả") || q.contains("giải hộ") || q.contains("làm hộ")) {
            out.reply = "Thầy hiểu em đang rất muốn biết kết quả cuối cùng! Nhưng nếu thầy giải hộ ngay, em sẽ bỏ lỡ cơ hội rèn luyện tư duy toán học của chính mình. "
                    + "Chúng ta cùng làm từng bước nhé! Em hãy đọc lại đề bài và cho thầy biết: Dữ kiện đề bài đã cho là gì và yêu cầu tìm cái gì?";
        } else if (q.contains("quy đồng")) {
            out.reply = "Quy đồng mẫu số nghĩa là biến đổi hai hoặc nhiều phân số sao cho chúng có cùng một mẫu số chung mà giá trị không đổi. "
                    + "Để bắt đầu, em hãy nhìn vào hai mẫu số trong bài của em và thử nhẩm xem: Số nhỏ nhất nào chia hết cho cả hai số đó?";
        } else {
            out.reply = "Câu hỏi rất thú vị! Để cùng giải quyết vấn đề trong bài học '" + context + "', "
                    + "theo em khái niệm hoặc công thức nào chúng ta vừa học có thể áp dụng đầu tiên?";
        }

        out.stepByStepHints.add("Gợi ý 1: Đọc kỹ câu hỏi và gạch chân các con số quan trọng.");
        out.stepByStepHints.add("Gợi ý 2: Kiểm tra xem mẫu số của các phân số đã bằng nhau chưa.");
        out.stepByStepHints.add("Gợi ý 3: Tự nhẩm thử một đáp án và đối chiếu lại với định nghĩa trong bài học.");
    }

    /**
     * Chế độ 3: Tạo câu hỏi luyện tập tương tác sau khi giải thích
     */
    private void handlePracticeMode(TutorOutput out, int gradeLevel, String q, String context) {
        out.reply = "Tuyệt vời! Sau khi đã nắm vững lý thuyết về '" + context + "', thầy đã tạo sẵn một câu hỏi luyện tập nhanh dành riêng cho Lớp " + gradeLevel + " để em thử sức ngay dưới đây:";

        if (gradeLevel <= 5) {
            out.interactiveQuiz = AiChatDto.InteractiveQuizDto.builder()
                    .id("quiz-gen-" + System.currentTimeMillis())
                    .question("Một hộp bánh có 12 chiếc bánh. Bạn Nam ăn hết 1/3 số bánh trong hộp. Hỏi bạn Nam đã ăn bao nhiêu chiếc bánh?")
                    .options(List.of("A. 3 chiếc bánh", "B. 4 chiếc bánh", "C. 6 chiếc bánh", "D. 9 chiếc bánh"))
                    .correctAnswer("B. 4 chiếc bánh")
                    .explanation("Giải thích: Muốn tìm 1/3 của 12 chiếc bánh, ta lấy 12 chia cho 3: 12 : 3 = 4 (chiếc bánh). Do đó đáp án đúng là B.")
                    .points(10)
                    .build();
        } else if (gradeLevel <= 9) {
            out.interactiveQuiz = AiChatDto.InteractiveQuizDto.builder()
                    .id("quiz-gen-" + System.currentTimeMillis())
                    .question("Tìm mẫu số chung nhỏ nhất của hai phân số 5/12 và 7/18:")
                    .options(List.of("A. 216", "B. 72", "C. 36", "D. 48"))
                    .correctAnswer("C. 36")
                    .explanation("Giải thích: 12 = 2² × 3; 18 = 2 × 3². BCNN(12, 18) = 2² × 3² = 4 × 9 = 36. Do đó mẫu số chung nhỏ nhất là 36.")
                    .points(10)
                    .build();
        } else {
            out.interactiveQuiz = AiChatDto.InteractiveQuizDto.builder()
                    .id("quiz-gen-" + System.currentTimeMillis())
                    .question("Tập xác định của hàm số y = (2x + 1) / (x² - 4) là:")
                    .options(List.of("A. D = R", "B. D = R \\ {2}", "C. D = R \\ {-2; 2}", "D. D = (-2; 2)"))
                    .correctAnswer("C. D = R \\ {-2; 2}")
                    .explanation("Giải thích: Hàm phân thức xác định khi mẫu số khác 0: x² - 4 ≠ 0 ⇔ x ≠ 2 và x ≠ -2. Vậy D = R \\ {-2; 2}.")
                    .points(10)
                    .build();
        }
    }

    /**
     * Chế độ 4: Giải thích vì sao câu trả lời sai (Misconception Diagnosis)
     */
    private void handleErrorDiagnosisMode(TutorOutput out, int gradeLevel, String q, String studentAnswer, String context) {
        String ans = studentAnswer != null ? studentAnswer : q;
        out.reply = "Thầy đã phân tích câu trả lời của em. Sai lầm trong học tập là cơ hội tuyệt vời nhất để hiểu sâu kiến thức! Dưới đây là phân tích chi tiết vì sao câu trả lời chưa chính xác:";

        if (ans.contains("+") || ans.contains("mẫu") || ans.contains("5/7")) {
            out.misconceptionReason = "Sai lầm phổ biến: Em đã vô tình cộng cả hai mẫu số với nhau (2/3 + 3/4 thành (2+3)/(3+4) = 5/7). "
                    + "Nguyên tắc cốt lõi: Mẫu số biểu thị độ lớn của từng phần chia, không được phép cộng gộp mẫu số! Em bắt buộc phải quy đồng về cùng một mẫu số chung trước khi cộng tử số.";
        } else {
            out.misconceptionReason = "Phân tích bẫy sai sót: Em có thể đã nhầm lẫn giữa phép nhân phân số và phép cộng phân số, hoặc quên đảo dấu khi chuyển vế. "
                    + "Hãy nhớ quy tắc: Phép cộng trừ cần mẫu chung, phép nhân thì lấy tử nhân tử, mẫu nhân mẫu.";
        }

        out.stepByStepHints.add("Cách khắc phục 1: Luôn viết rõ bước quy đồng mẫu số ra giấy nháp trước.");
        out.stepByStepHints.add("Cách khắc phục 2: Giữ nguyên mẫu số chung, chỉ thực hiện phép cộng trên tử số.");
        out.stepByStepHints.add("Cách khắc phục 3: Rút gọn phân số về tối giản sau khi có kết quả.");
    }

    /**
     * Chế độ 5: Trích dẫn bài học hoặc tài liệu SGK làm căn cứ
     */
    private void handleCitationMode(TutorOutput out, int gradeLevel, String q, String context) {
        out.reply = "Dưới đây là các căn cứ tài liệu chính thức theo Chương trình Giáo dục Phổ thông 2018 và bài giảng trực tuyến của DMKLab cho chủ đề '" + context + "':";
    }

    private void addStandardCitations(TutorOutput out, int gradeLevel, String context) {
        if (gradeLevel <= 5) {
            out.citations.add(AiChatDto.CitationDto.builder()
                    .title("Bài 3: Khái niệm phân số và phân số bằng nhau")
                    .chapter("Chương 1: Ôn tập và Bổ sung về Phân số")
                    .sourceBook("SGK Toán 5 - Bộ sách Kết nối tri thức với cuộc sống (Trang 10-14)")
                    .videoTime("02:30 (Mục 1: Khái niệm Tử số và Mẫu số)")
                    .targetUrl("/?lessonId=les-01")
                    .build());
            out.citations.add(AiChatDto.CitationDto.builder()
                    .title("Bài 4: Tính chất cơ bản của phân số")
                    .chapter("Chương 1: Phân số & Phép tính")
                    .sourceBook("Vở bài tập Toán 5 Tập 1 (Trang 8)")
                    .videoTime("05:30 (Mục 2: Ví dụ minh họa cắt bánh)")
                    .targetUrl("/?lessonId=les-02")
                    .build());
        } else if (gradeLevel <= 9) {
            out.citations.add(AiChatDto.CitationDto.builder()
                    .title("Bài 2: Quy đồng mẫu nhiều phân số")
                    .chapter("Chương 5: Phân số và Số thập phân")
                    .sourceBook("SGK Toán 6 Tập 2 - Bộ sách Cánh Diều (Trang 15-18)")
                    .videoTime("03:15 (Quy tắc tìm BCNN làm MSC)")
                    .targetUrl("/?lessonId=les-02")
                    .build());
        } else {
            out.citations.add(AiChatDto.CitationDto.builder()
                    .title("Bài 1: Mệnh đề toán học và Tập hợp")
                    .chapter("Chương 1: Mệnh đề & Tập hợp")
                    .sourceBook("SGK Toán 10 Tập 1 - Bộ sách Chân trời sáng tạo (Trang 7-12)")
                    .videoTime("04:45 (Phương pháp chứng minh phản chứng)")
                    .targetUrl("/?lessonId=les-03")
                    .build());
        }
    }

    private String generateAdminGuidanceResponse(String question) {
        String q = question.toLowerCase();
        if (q.contains("video") || q.contains("upload")) {
            return "Để tải lên video bài giảng, hệ thống sử dụng S3 Presigned URL (Mục 8.2 trong PDF kiến trúc). Trình duyệt của bạn sẽ upload trực tiếp lên Object Storage để tránh tắc nghẽn backend Spring Boot, sau đó worker sẽ chuyển mã HLS multi-bitrate.";
        } else if (q.contains("người dùng") || q.contains("user") || q.contains("role")) {
            return "Quản lý tài khoản: Truy cập tab 'Quản trị Người Dùng'. Bạn có thể tra cứu thông tin học sinh, giáo viên, kích hoạt hoặc vô hiệu hóa tài khoản với phân quyền RBAC.";
        } else if (q.contains("báo cáo") || q.contains("report")) {
            return "Báo cáo thống kê: API `GET /api/v1/admin/reports/overview` tổng hợp số lượng học viên, tỷ lệ hoàn thành bài học, tổng lượt làm quiz và số bài học theo môn.";
        } else {
            return "Trợ lý Quản trị: Bạn có thể tra cứu thông tin vận hành, quy trình xử lý video, phân quyền RBAC và kiểm tra audit log hệ thống.";
        }
    }
}
