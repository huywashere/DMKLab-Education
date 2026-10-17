package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/huywashere/dmklab-ai-proxy/internal/cache"
	"github.com/huywashere/dmklab-ai-proxy/internal/config"
	"github.com/huywashere/dmklab-ai-proxy/internal/openai"
)

func TestSSEStreamingFormat(t *testing.T) {
	cfg := &config.Config{
		OpenAIKey:       "mock-key",
		TypingCadenceMs: 1, // fast for testing
	}
	promptCache := cache.NewPromptCache(context.Background(), cfg)
	client := openai.NewStreamClient(cfg)
	handler := NewStreamHandler(cfg, promptCache, client)

	reqBody, _ := json.Marshal(StreamRequest{
		Message:    "Làm sao để cộng hai phân số?",
		Subject:    "Toán học K-12",
		GradeLevel: 5,
		Mode:       "SOCRATIC",
	})

	req := httptest.NewRequest(http.MethodPost, "/api/v1/ai/stream", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", resp.StatusCode)
	}

	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(contentType, "text/event-stream") {
		t.Errorf("Expected Content-Type text/event-stream, got %s", contentType)
	}

	body := w.Body.String()
	if !strings.Contains(body, "event: start") {
		t.Errorf("Response missing event: start. Body:\n%s", body)
	}
	if !strings.Contains(body, "event: delta") {
		t.Errorf("Response missing event: delta. Body:\n%s", body)
	}
	if !strings.Contains(body, "event: done") {
		t.Errorf("Response missing event: done. Body:\n%s", body)
	}
}

func TestPromptCacheHit(t *testing.T) {
	cfg := &config.Config{
		OpenAIKey:       "mock-key",
		TypingCadenceMs: 1,
	}
	promptCache := cache.NewPromptCache(context.Background(), cfg)
	client := openai.NewStreamClient(cfg)
	handler := NewStreamHandler(cfg, promptCache, client)

	prompt := "Phương trình bậc nhất 2x + 4 = 0 giải như thế nào?"

	// 1st request -> Cache MISS
	reqBody1, _ := json.Marshal(StreamRequest{
		Message:    prompt,
		Subject:    "Toán học K-12",
		GradeLevel: 8,
		Mode:       "SOCRATIC",
	})
	w1 := httptest.NewRecorder()
	handler.ServeHTTP(w1, httptest.NewRequest(http.MethodPost, "/api/v1/ai/stream", bytes.NewBuffer(reqBody1)))

	body1 := w1.Body.String()
	if strings.Contains(body1, "\"cached\":true") {
		t.Errorf("First request should be cache miss: %s", body1)
	}

	// 2nd request with same question -> MUST BE CACHE HIT!
	reqBody2, _ := json.Marshal(StreamRequest{
		Message:    "   " + prompt + "   ", // with spaces
		Subject:    "Toán học K-12",
		GradeLevel: 8,
		Mode:       "SOCRATIC",
	})
	w2 := httptest.NewRecorder()
	handler.ServeHTTP(w2, httptest.NewRequest(http.MethodPost, "/api/v1/ai/stream", bytes.NewBuffer(reqBody2)))

	body2 := w2.Body.String()
	if !strings.Contains(body2, "\"cached\":true") {
		t.Errorf("Second request MUST be cache hit! Body:\n%s", body2)
	}

	stats := promptCache.GetStats()
	if stats.CacheHits < 1 {
		t.Errorf("Expected at least 1 cache hit, got %d", stats.CacheHits)
	}
}
