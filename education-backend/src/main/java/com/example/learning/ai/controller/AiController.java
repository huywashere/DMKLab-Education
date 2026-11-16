package com.example.learning.ai.controller;

import com.example.learning.ai.dto.AiChatDto;
import com.example.learning.ai.service.AiService;
import com.example.learning.platform.api.ApiResponse;
import com.example.learning.platform.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

/**
 * AI Controller - Proxy layer sang Python AI Microservice (FastAPI/port 8000)
 * Nếu Python service không khả dụng, fallback sang Java AiService nội bộ.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Chatbots", description = "Chatbot học tập Socratic DMK AI & Trợ lý Quản trị")
public class AiController {

    private final AiService aiService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai.python-service-url:http://localhost:8000}")
    private String pythonServiceUrl;

    @Value("${app.ai.python-service-enabled:true}")
    private boolean pythonServiceEnabled;

    // ======================================================
    // POST /api/v1/ai/learning/chat
    // ======================================================
    @PostMapping("/learning/chat")
    @Operation(summary = "Chatbot học tập Socratic dành cho học sinh (Có kiểm soát quota & ngữ cảnh)",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AiChatDto.ChatResponse>> learningChat(
            @RequestBody AiChatDto.ChatRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal != null ? principal.getId()
                : UUID.fromString("33333333-3333-3333-3333-333333333333");

        // Thử proxy sang Python AI service trước
        if (pythonServiceEnabled) {
            AiChatDto.ChatResponse pyResp = proxyToPythonService(
                    "/api/v1/ai/learning/chat", req, userId, AiChatDto.ChatResponse.class
            );
            if (pyResp != null) {
                return ResponseEntity.ok(ApiResponse.success(pyResp));
            }
            log.warn("[AI_PROXY_FALLBACK] Python AI service không khả dụng, dùng Java AiService.");
        }

        // Fallback: Java AiService
        return ResponseEntity.ok(ApiResponse.success(aiService.processLearningChat(userId, req)));
    }

    // ======================================================
    // GET /api/v1/ai/learning/chat/stream (SSE)
    // ======================================================
    @GetMapping(value = "/learning/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Streaming Socratic AI Response qua Server-Sent Events (SSE)")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamLearningChat(
            @RequestParam String message,
            @RequestParam(required = false) String lessonTitle,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false, defaultValue = "5") int gradeLevel,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal != null ? principal.getId()
                : UUID.fromString("33333333-3333-3333-3333-333333333333");
        AiChatDto.ChatRequest req = AiChatDto.ChatRequest.builder()
                .message(message)
                .contextLessonTitle(lessonTitle)
                .contextSubject(subject)
                .gradeLevel(gradeLevel)
                .build();
        return aiService.streamLearningChat(userId, req);
    }

    // ======================================================
    // POST /api/v1/ai/admin/chat
    // ======================================================
    @PostMapping("/admin/chat")
    @Operation(summary = "Chatbot hướng dẫn nghiệp vụ dành cho Quản trị viên & Giáo viên",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AiChatDto.ChatResponse>> adminChat(
            @RequestBody AiChatDto.ChatRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID userId = principal != null ? principal.getId()
                : UUID.fromString("11111111-1111-1111-1111-111111111111");

        if (pythonServiceEnabled) {
            AiChatDto.ChatResponse pyResp = proxyToPythonService(
                    "/api/v1/ai/admin/chat", req, userId, AiChatDto.ChatResponse.class
            );
            if (pyResp != null) {
                return ResponseEntity.ok(ApiResponse.success(pyResp));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(aiService.processAdminChat(userId, req)));
    }

    // ======================================================
    // GET /api/v1/ai/sessions/{sessionId}/history
    // ======================================================
    @GetMapping("/sessions/{sessionId}/history")
    @Operation(summary = "Lấy lịch sử tin nhắn của một phiên hội thoại AI",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<AiChatDto.MessageItem>>> getHistory(
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(ApiResponse.success(aiService.getSessionHistory(sessionId)));
    }

    // ======================================================
    // POST /api/v1/ai/messages/{messageId}/feedback
    // ======================================================
    @PostMapping("/messages/{messageId}/feedback")
    @Operation(summary = "Đánh giá chất lượng câu trả lời của AI (RLHF Feedback thu thập dữ liệu huấn luyện)")
    public ResponseEntity<ApiResponse<Boolean>> submitFeedback(
            @PathVariable UUID messageId,
            @RequestBody AiChatDto.MessageFeedbackRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
                aiService.recordMessageFeedback(messageId, req.getRating(), req.getComment())));
    }

    // ======================================================
    // PRIVATE: Proxy helper
    // ======================================================
    @SuppressWarnings("unchecked")
    private <T> T proxyToPythonService(String path, Object body, UUID userId, Class<T> responseType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-User-Id", userId.toString());

            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            String url = pythonServiceUrl.replaceAll("/+$", "") + path;

            ResponseEntity<java.util.Map> raw = restTemplate.exchange(
                    url, HttpMethod.POST, entity, java.util.Map.class
            );

            if (raw.getStatusCode().is2xxSuccessful() && raw.getBody() != null) {
                Object data = ((java.util.Map<?, ?>) raw.getBody()).get("data");
                if (data != null) {
                    com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                    om.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
                    om.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                    return om.convertValue(data, responseType);
                }
            }
        } catch (Exception ex) {
            log.warn("[AI_PROXY_ERROR] Lỗi gọi Python AI service tại {}: {}", path, ex.getMessage());
        }
        return null;
    }
}
