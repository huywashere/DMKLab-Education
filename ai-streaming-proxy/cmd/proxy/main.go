package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/huywashere/dmklab-ai-proxy/internal/cache"
	"github.com/huywashere/dmklab-ai-proxy/internal/config"
	"github.com/huywashere/dmklab-ai-proxy/internal/handler"
	"github.com/huywashere/dmklab-ai-proxy/internal/openai"
)

var startTime = time.Now()

func main() {
	log.Println("==================================================================")
	log.Println(" DMKLab Education - AI Streaming Proxy & Prompt Cache (Golang)   ")
	log.Println(" High-Concurrency SSE Multiplexer for Socratic K-12 AI Tutor     ")
	log.Println("==================================================================")

	cfg := config.LoadConfig()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 1. Initialize Components
	promptCache := cache.NewPromptCache(ctx, cfg)
	openAIClient := openai.NewStreamClient(cfg)
	streamHandler := handler.NewStreamHandler(cfg, promptCache, openAIClient)

	log.Printf("[AI_CONFIG] OpenAI Mode: %s, Model: %s, Redis: %s",
		map[bool]string{true: "LIVE_API", false: "MOCK_SOCRATIC_FALLBACK"}[cfg.IsLiveOpenAI()],
		cfg.OpenAIModel,
		cfg.RedisAddr,
	)

	// 2. HTTP Routes
	mux := http.NewServeMux()

	// SSE Streaming Endpoint
	mux.Handle("/api/v1/ai/stream", streamHandler)

	// Health Check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		cacheStats := promptCache.GetStats()
		res := map[string]interface{}{
			"status":            "UP",
			"service":           "dmklab-ai-streaming-proxy",
			"language":          "Golang 1.23 / 1.27",
			"uptime":            time.Since(startTime).String(),
			"openAiLive":        cfg.IsLiveOpenAI(),
			"model":             cfg.OpenAIModel,
			"activeConnections": streamHandler.GetActiveConnections(),
			"totalServed":       streamHandler.GetTotalServed(),
			"promptCache":       cacheStats,
		}
		_ = json.NewEncoder(w).Encode(res)
	})

	// Stats Endpoint
	mux.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		cacheStats := promptCache.GetStats()
		res := map[string]interface{}{
			"activeConnections": streamHandler.GetActiveConnections(),
			"totalServed":       streamHandler.GetTotalServed(),
			"cacheStats":        cacheStats,
		}
		_ = json.NewEncoder(w).Encode(res)
	})

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      mux,
		ReadTimeout:  60 * time.Second, // Long-lived SSE streams
		WriteTimeout: 60 * time.Second,
	}

	go func() {
		log.Printf("[HTTP_SERVER] AI Streaming Proxy listening on http://localhost:%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] HTTP server error: %v", err)
		}
	}()

	// 3. Graceful Shutdown
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	<-stopChan
	log.Println("\n[SHUTDOWN] Received termination signal, gracefully closing connections...")

	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	_ = server.Shutdown(shutdownCtx)
	promptCache.Close()

	log.Println("[SHUTDOWN] AI Streaming Proxy stopped cleanly.")
}
