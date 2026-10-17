package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/huywashere/dmklab-ai-proxy/internal/cache"
	"github.com/huywashere/dmklab-ai-proxy/internal/config"
	"github.com/huywashere/dmklab-ai-proxy/internal/openai"
)

type StreamRequest struct {
	Message    string `json:"message"`
	Subject    string `json:"subject"`
	GradeLevel int    `json:"gradeLevel"`
	Mode       string `json:"mode"`
	SessionID  string `json:"sessionId"`
}

type StreamHandler struct {
	cfg         *config.Config
	cache       *cache.PromptCache
	client      *openai.StreamClient
	activeConns atomic.Int64
	totalServed atomic.Int64
}

func NewStreamHandler(
	cfg *config.Config,
	cache *cache.PromptCache,
	client *openai.StreamClient,
) *StreamHandler {
	return &StreamHandler{
		cfg:    cfg,
		cache:  cache,
		client: client,
	}
}

func (h *StreamHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Enable CORS for frontend
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported by response writer", http.StatusInternalServerError)
		return
	}

	var req StreamRequest
	if r.Method == http.MethodPost {
		_ = json.NewDecoder(r.Body).Decode(&req)
	} else if r.Method == http.MethodGet {
		req.Message = r.URL.Query().Get("message")
		req.Subject = r.URL.Query().Get("subject")
		req.Mode = r.URL.Query().Get("mode")
		req.SessionID = r.URL.Query().Get("sessionId")
	}

	if req.Message == "" {
		http.Error(w, "Query parameter or JSON 'message' is required", http.StatusBadRequest)
		return
	}
	if req.Subject == "" {
		req.Subject = "Toán học K-12"
	}
	if req.GradeLevel <= 0 {
		req.GradeLevel = 5
	}
	if req.Mode == "" {
		req.Mode = "SOCRATIC"
	}
	if req.SessionID == "" {
		req.SessionID = uuid.New().String()
	}

	// Set SSE Headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	h.activeConns.Add(1)
	h.totalServed.Add(1)
	defer h.activeConns.Add(-1)

	ctx := r.Context()

	// 1. Check Prompt Cache in Redis / RAM
	cacheKey := h.cache.GenerateKey(req.Message, req.Subject, req.GradeLevel, req.Mode)
	if cachedReply, found := h.cache.Get(ctx, cacheKey); found {
		// CACHE HIT: Stream cached response at fast cadence without calling OpenAI!
		h.streamCachedResponse(w, flusher, ctx, req.SessionID, req.Mode, cachedReply)
		return
	}

	// 2. CACHE MISS: Stream from OpenAI or fallback generator, and cache response
	h.streamLiveResponse(w, flusher, ctx, req, cacheKey)
}

func (h *StreamHandler) streamCachedResponse(
	w http.ResponseWriter,
	flusher http.Flusher,
	ctx context.Context,
	sessionID, mode, cachedReply string,
) {
	startPayload, _ := json.Marshal(map[string]interface{}{
		"sessionId": sessionID,
		"cached":    true,
		"mode":      mode,
		"status":    "STREAMING_FROM_PROMPT_CACHE",
	})
	fmt.Fprintf(w, "event: start\ndata: %s\n\n", startPayload)
	flusher.Flush()

	words := strings.Split(cachedReply, " ")
	for _, word := range words {
		select {
		case <-ctx.Done():
			return
		default:
			deltaPayload, _ := json.Marshal(map[string]string{
				"text": word + " ",
			})
			fmt.Fprintf(w, "event: delta\ndata: %s\n\n", deltaPayload)
			flusher.Flush()
			time.Sleep(15 * time.Millisecond) // Simulated natural typing speed
		}
	}

	donePayload, _ := json.Marshal(map[string]interface{}{
		"sessionId":   sessionID,
		"cached":      true,
		"fullReply":   cachedReply,
		"tokensSaved": len(cachedReply) / 4,
	})
	fmt.Fprintf(w, "event: done\ndata: %s\n\n", donePayload)
	flusher.Flush()
}

func (h *StreamHandler) streamLiveResponse(
	w http.ResponseWriter,
	flusher http.Flusher,
	ctx context.Context,
	req StreamRequest,
	cacheKey string,
) {
	startPayload, _ := json.Marshal(map[string]interface{}{
		"sessionId": req.SessionID,
		"cached":    false,
		"mode":      req.Mode,
		"status":    "STREAMING_LIVE",
	})
	fmt.Fprintf(w, "event: start\ndata: %s\n\n", startPayload)
	flusher.Flush()

	tokenChan := make(chan string, 32)
	go func() {
		_ = h.client.StreamCompletion(ctx, req.Message, req.Subject, req.GradeLevel, req.Mode, tokenChan)
	}()

	var fullReplyBuilder strings.Builder

	for token := range tokenChan {
		select {
		case <-ctx.Done():
			return
		default:
			fullReplyBuilder.WriteString(token)
			deltaPayload, _ := json.Marshal(map[string]string{
				"text": token,
			})
			fmt.Fprintf(w, "event: delta\ndata: %s\n\n", deltaPayload)
			flusher.Flush()
		}
	}

	fullReply := fullReplyBuilder.String()
	// Store in Redis Prompt Cache for subsequent students asking the same question!
	h.cache.Set(ctx, cacheKey, fullReply)

	donePayload, _ := json.Marshal(map[string]interface{}{
		"sessionId": req.SessionID,
		"cached":    false,
		"fullReply": fullReply,
	})
	fmt.Fprintf(w, "event: done\ndata: %s\n\n", donePayload)
	flusher.Flush()
}

func (h *StreamHandler) GetActiveConnections() int64 {
	return h.activeConns.Load()
}

func (h *StreamHandler) GetTotalServed() int64 {
	return h.totalServed.Load()
}
