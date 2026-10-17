package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/huywashere/dmklab-video-transcoder/internal/config"
	"github.com/huywashere/dmklab-video-transcoder/internal/ffmpeg"
	"github.com/huywashere/dmklab-video-transcoder/internal/queue"
	"github.com/huywashere/dmklab-video-transcoder/internal/storage"
	"github.com/huywashere/dmklab-video-transcoder/internal/webhook"
)

var startTime = time.Now()

func main() {
	log.Println("==================================================================")
	log.Println(" DMKLab Education - Video Transcoder Microservice (Golang)")
	log.Println(" HLS Adaptive Streaming + Cloudflare R2 / S3 + Watermark Pipeline")
	log.Println("==================================================================")

	cfg := config.LoadConfig()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 1. Initialize Components
	transcoder := ffmpeg.NewTranscoder()
	log.Printf("[FFMPEG_STATUS] FFmpeg installed on system: %v", transcoder.IsFFmpegAvailable())

	s3Client, err := storage.NewS3Client(ctx, cfg)
	if err != nil {
		log.Fatalf("[FATAL] Failed to initialize storage client: %v", err)
	}

	notifier := webhook.NewNotifier()
	consumer := queue.NewConsumer(cfg, transcoder, s3Client, notifier)

	// 2. Start Redis Queue Consumer
	consumer.Start(ctx)

	// 3. HTTP Server Setup
	mux := http.NewServeMux()

	// GET /health
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		stats := consumer.GetStats()
		res := map[string]interface{}{
			"status":          "UP",
			"service":         "dmklab-video-transcoder-worker",
			"language":        "Golang 1.23 / 1.27",
			"uptime":          time.Since(startTime).String(),
			"storageProvider": cfg.StorageProvider,
			"isStorageLive":   s3Client.IsLive(),
			"ffmpegAvailable": transcoder.IsFFmpegAvailable(),
			"workerStats":     stats,
		}
		_ = json.NewEncoder(w).Encode(res)
	})

	// GET /stats
	mux.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(consumer.GetStats())
	})

	// POST /api/v1/transcode/submit
	mux.HandleFunc("/api/v1/transcode/submit", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var job queue.TranscodeJob
		if err := json.NewDecoder(r.Body).Decode(&job); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON body: %v", err), http.StatusBadRequest)
			return
		}

		if job.StorageKey == "" {
			http.Error(w, "storageKey is required", http.StatusBadRequest)
			return
		}

		// Push to Redis or process asynchronously
		go func(j queue.TranscodeJob) {
			_ = consumer.ProcessJob(context.Background(), j)
		}(job)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "ACCEPTED",
			"message": "Transcoding job accepted and queued for processing.",
			"job":     job,
		})
	})

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Printf("[HTTP_SERVER] Video Transcoder Worker listening on http://localhost:%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] HTTP server error: %v", err)
		}
	}()

	// 4. Graceful Shutdown on SIGINT/SIGTERM
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	<-stopChan
	log.Println("\n[SHUTDOWN] Received termination signal, gracefully shutting down...")

	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	_ = server.Shutdown(shutdownCtx)
	consumer.Shutdown()

	log.Println("[SHUTDOWN] Video Transcoder Worker stopped cleanly.")
}
