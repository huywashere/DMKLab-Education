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

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/huywashere/dmklab-live-gateway/internal/aggregator"
	"github.com/huywashere/dmklab-live-gateway/internal/config"
	"github.com/huywashere/dmklab-live-gateway/internal/hub"
)

var (
	startTime = time.Now()
	upgrader  = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins in K-12 web app
		},
	}
)

func main() {
	log.Println("==================================================================")
	log.Println(" DMKLab Education - Live Gateway & Heartbeat Aggregator (Golang) ")
	log.Println(" High-Concurrency WebSocket Hub + Write-Behind Progress Cache     ")
	log.Println("==================================================================")

	cfg := config.LoadConfig()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 1. Initialize Aggregator & RoomHub
	agg := aggregator.NewHeartbeatAggregator(cfg)
	agg.StartFlushTicker(ctx)

	roomHub := hub.NewRoomHub(agg)
	go roomHub.Run()

	// 2. HTTP & WebSocket Routes
	mux := http.NewServeMux()

	// WebSocket Gateway: /ws or /api/v1/live/ws
	handleWS := func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("[WS_UPGRADE_ERR] Failed to upgrade WebSocket: %v", err)
			return
		}

		userID := r.URL.Query().Get("userId")
		if userID == "" {
			userID = "guest-" + uuid.New().String()[:8]
		}
		userName := r.URL.Query().Get("userName")
		lessonID := r.URL.Query().Get("lessonId")

		client := &hub.Client{
			Hub:      roomHub,
			Conn:     conn,
			Send:     make(chan []byte, 256),
			UserID:   userID,
			UserName: userName,
		}

		roomHub.RegisterClient(client)

		if lessonID != "" {
			roomHub.JoinRoom(client, lessonID)
		}

		go client.WritePump()
		go client.ReadPump()
	}

	mux.HandleFunc("/ws", handleWS)
	mux.HandleFunc("/api/v1/live/ws", handleWS)

	// GET /health
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		hubStats := roomHub.GetStats()
		aggStats := agg.GetStats()

		res := map[string]interface{}{
			"status":            "UP",
			"service":           "dmklab-live-gateway",
			"language":          "Golang 1.23 / 1.27",
			"uptime":            time.Since(startTime).String(),
			"webSocketStats":    hubStats,
			"writeBehindCache":  aggStats,
			"backendSyncTarget": cfg.BackendSyncURL,
		}
		_ = json.NewEncoder(w).Encode(res)
	})

	// GET /stats
	mux.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"hub":        roomHub.GetStats(),
			"aggregator": agg.GetStats(),
		})
	})

	// GET /api/v1/live/presence?lessonId=...
	mux.HandleFunc("/api/v1/live/presence", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		lessonID := r.URL.Query().Get("lessonId")
		count := roomHub.GetPresence(lessonID)

		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"lessonId":       lessonID,
			"activeStudents": count,
			"timestamp":      time.Now().UTC(),
		})
	})

	// POST /api/v1/live/flush
	mux.HandleFunc("/api/v1/live/flush", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		count := agg.Flush(r.Context())
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"flushedCount": count,
			"message":      "Write-Behind cache flushed successfully to backend.",
		})
	})

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Printf("[LIVE_GATEWAY] Listening on http://localhost:%s (WS: ws://localhost:%s/ws)", cfg.Port, cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] HTTP server error: %v", err)
		}
	}()

	// 3. Graceful Shutdown
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	<-stopChan
	log.Println("\n[SHUTDOWN] Received termination signal, shutting down Live Gateway...")

	cancel()

	// Final flush before exit
	agg.Flush(context.Background())

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	_ = server.Shutdown(shutdownCtx)
	log.Println("[SHUTDOWN] Live Gateway stopped cleanly.")
}
