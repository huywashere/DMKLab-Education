package com.example.learning.ai.controller;

import com.example.learning.ai.dto.AiChatDto;
import com.example.learning.ai.service.AiService;
import com.example.learning.platform.api.ApiResponse;
import com.example.learning.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Chatbots", description = "Chatbot học tập Socratic DMK AI & Trợ lý Quản trị")
public class AiController {

    private final AiService aiService;

    @PostMapping("/learning/chat")
    @Operation(summary = "Chatbot học tập Socratic dành cho học sinh (Có kiểm soát quota & ngữ cảnh)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AiChatDto.ChatResponse>> learningChat(
            @RequestBody AiChatDto.ChatRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal != null ? principal.getId() : UUID.fromString("33333333-3333-3333-3333-333333333333");
        return ResponseEntity.ok(ApiResponse.success(
                aiService.processLearningChat(userId, req)));
    }

    @GetMapping(value = "/learning/chat/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Streaming Socratic AI Response qua Server-Sent Events (SSE)")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamLearningChat(
            @RequestParam String message,
            @RequestParam(required = false) String lessonTitle,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false, defaultValue = "5") int gradeLevel,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal != null ? principal.getId() : UUID.fromString("33333333-3333-3333-3333-333333333333");
        AiChatDto.ChatRequest req = AiChatDto.ChatRequest.builder()
                .message(message)
                .contextLessonTitle(lessonTitle)
                .contextSubject(subject)
                .gradeLevel(gradeLevel)
                .build();

        return aiService.streamLearningChat(userId, req);
    }

    @PostMapping("/admin/chat")
    @Operation(summary = "Chatbot hướng dẫn nghiệp vụ dành cho Quản trị viên & Giáo viên", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AiChatDto.ChatResponse>> adminChat(
            @RequestBody AiChatDto.ChatRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal != null ? principal.getId() : UUID.fromString("11111111-1111-1111-1111-111111111111");
        return ResponseEntity.ok(ApiResponse.success(
                aiService.processAdminChat(userId, req)));
    }

    @GetMapping("/sessions/{sessionId}/history")
    @Operation(summary = "Lấy lịch sử tin nhắn của một phiên hội thoại AI", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<AiChatDto.MessageItem>>> getHistory(
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ApiResponse.success(
                aiService.getSessionHistory(sessionId)));
    }

    @PostMapping("/messages/{messageId}/feedback")
    @Operation(summary = "Đánh giá chất lượng câu trả lời của AI (RLHF Feedback thu thập dữ liệu huấn luyện)")
    public ResponseEntity<ApiResponse<Boolean>> submitFeedback(
            @PathVariable UUID messageId,
            @RequestBody AiChatDto.MessageFeedbackRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
                aiService.recordMessageFeedback(messageId, req.getRating(), req.getComment())));
    }
}
