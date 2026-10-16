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
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    @Value("${app.ai.openai.student-daily-quota:30}")
    private int dailyQuota;

    @Transactional
    public AiChatDto.ChatResponse processLearningChat(UUID userId, AiChatDto.ChatRequest req) {
        // 1. Quota check (PDF Section 9.1 & 14.1)
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        long usedToday = messageRepository.countUserMessagesSince(userId, startOfDay);
        if (usedToday >= dailyQuota) {
            throw new RuntimeException("Bạn đã dùng hết hạn mức " + dailyQuota + " câu hỏi trợ lý AI trong ngày. Hạn mức sẽ tự động đặt lại vào ngày mai!");
        }

        // 2. Find or create ChatSession
        ChatSession session;
        if (req.getSessionId() != null) {
            session = sessionRepository.findById(req.getSessionId())
                    .orElseGet(() -> createSession(userId, "LEARNING", req.getContextLessonTitle()));
        } else {
            session = sessionRepository.findFirstByUserIdAndSessionTypeOrderByCreatedAtDesc(userId, "LEARNING")
                    .orElseGet(() -> createSession(userId, "LEARNING", req.getContextLessonTitle()));
        }

        // 3. Save User message
        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(session.getId())
                .senderRole("USER")
                .content(req.getMessage())
                .tokensUsed(req.getMessage().length() / 4)
                .build();
        messageRepository.save(userMsg);

        // 4. Generate Socratic Dialogue Response
        String socraticReply = generateSocraticResponse(req.getMessage(), req.getContextLessonTitle(), req.getContextSubject());

        // 5. Save Assistant response
        ChatMessage assistantMsg = ChatMessage.builder()
                .sessionId(session.getId())
                .senderRole("ASSISTANT")
                .content(socraticReply)
                .tokensUsed(socraticReply.length() / 4)
                .build();
        messageRepository.save(assistantMsg);

        int remaining = Math.max(0, (int) (dailyQuota - (usedToday + 1)));

        return AiChatDto.ChatResponse.builder()
                .sessionId(session.getId())
                .reply(socraticReply)
                .isSocraticHint(true)
                .dailyQuotaRemaining(remaining)
                .timestamp(Instant.now())
                .build();
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

    private ChatSession createSession(UUID userId, String type, String title) {
        return sessionRepository.save(ChatSession.builder()
                .userId(userId)
                .sessionType(type)
                .title(title != null ? title : ("Phiên học " + type))
                .build());
    }

    private String generateSocraticResponse(String question, String lessonTitle, String subject) {
        String qLower = question.toLowerCase();

        if (qLower.contains("mệnh đề") || (lessonTitle != null && lessonTitle.toLowerCase().contains("mệnh đề"))) {
            return "Để nhận biết một khẳng định có phải là mệnh đề toán học hay không, em hãy tự đặt câu hỏi: Khẳng định này có thể xác định rõ ràng là ĐÚNG hoặc SAI hay không? Hãy thử kiểm tra từng vế và cho thầy biết suy nghĩ của em nhé!";
        } else if (qLower.contains("tập hợp") || qLower.contains("giao") || qLower.contains("hợp")) {
            return "Trong toán học, phép giao (∩) lấy các phần tử chung của cả hai tập hợp, còn phép hợp (∪) gom tất cả phần tử của hai tập lại. Em thử liệt kê các phần tử của từng tập hợp ra nháp xem phần tử nào xuất hiện ở cả hai nơi?";
        } else if (qLower.contains("bất phương trình") || qLower.contains("miền nghiệm")) {
            return "Để biểu diễn miền nghiệm của bất phương trình ax + by ≤ c, bước 1 em vẽ đường thẳng ax + by = c. Bước 2, em chọn một điểm thử (thường là gốc tọa độ O(0,0)) để kiểm tra. Điểm O(0,0) có thỏa mãn bất phương trình của em không?";
        } else if (qLower.contains("đáp án") || qLower.contains("giải hộ") || qLower.contains("làm hộ")) {
            return "Thầy Khanmigo luôn đồng hành để giúp em tự mình hiểu bài! Hãy chia sẻ bước đầu tiên em đã nghĩ ra hoặc chỗ em cảm thấy bối rối nhất, chúng ta cùng gỡ rối từng bước nhé!";
        } else {
            return "Câu hỏi rất hay! Để cùng giải quyết vấn đề này, theo em khái niệm cốt lõi nào liên quan đến bài học '" 
                    + (lessonTitle != null ? lessonTitle : "K-12") + "' mà chúng ta có thể áp dụng trước tiên?";
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
