package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/huywashere/dmklab-video-transcoder/internal/config"
	"github.com/huywashere/dmklab-video-transcoder/internal/ffmpeg"
	"github.com/huywashere/dmklab-video-transcoder/internal/storage"
	"github.com/huywashere/dmklab-video-transcoder/internal/webhook"
	"github.com/redis/go-redis/v9"
)

type TranscodeJob struct {
	JobID           string   `json:"jobId"`
	LessonID        string   `json:"lessonId"`
	StorageKey      string   `json:"storageKey"`
	WatermarkText   string   `json:"watermarkText"`
	TargetQualities []string `json:"targetQualities"`
	CallbackURL     string   `json:"callbackUrl"`
}

type WorkerStats struct {
	TotalProcessed int64  `json:"totalProcessed"`
	TotalSuccess   int64  `json:"totalSuccess"`
	TotalFailed    int64  `json:"totalFailed"`
	ActiveJobs     int64  `json:"activeJobs"`
	QueueName      string `json:"queueName"`
	IsConnected    bool   `json:"isConnected"`
}

type Consumer struct {
	cfg        *config.Config
	rdb        *redis.Client
	transcoder *ffmpeg.Transcoder
	storage    *storage.S3Client
	notifier   *webhook.Notifier
	semaphore  chan struct{}
	wg         sync.WaitGroup

	totalProcessed atomic.Int64
	totalSuccess   atomic.Int64
	totalFailed    atomic.Int64
	activeJobs     atomic.Int64
	isConnected    atomic.Bool
}

func NewConsumer(
	cfg *config.Config,
	transcoder *ffmpeg.Transcoder,
	storage *storage.S3Client,
	notifier *webhook.Notifier,
) *Consumer {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       0,
	})

	return &Consumer{
		cfg:        cfg,
		rdb:        rdb,
		transcoder: transcoder,
		storage:    storage,
		notifier:   notifier,
		semaphore:  make(chan struct{}, cfg.MaxConcurrentJobs),
	}
}

func (c *Consumer) Start(ctx context.Context) {
	// Test Redis connection
	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if err := c.rdb.Ping(pingCtx).Err(); err != nil {
		log.Printf("[REDIS_WARN] Could not connect to Redis at %s (%v). Worker running with HTTP submission mode.", c.cfg.RedisAddr, err)
		c.isConnected.Store(false)
	} else {
		log.Printf("[REDIS_CONNECTED] Listening on queue '%s' at %s", c.cfg.RedisQueue, c.cfg.RedisAddr)
		c.isConnected.Store(true)
	}

	go c.listenLoop(ctx)
}

func (c *Consumer) listenLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			log.Println("[CONSUMER] Shutting down Redis queue listener...")
			return
		default:
			if !c.isConnected.Load() {
				// Retry connection every 5s if disconnected
				time.Sleep(5 * time.Second)
				if err := c.rdb.Ping(ctx).Err(); err == nil {
					log.Printf("[REDIS_RECONNECTED] Connected to Redis queue %s", c.cfg.RedisQueue)
					c.isConnected.Store(true)
				}
				continue
			}

			// Block pop for 3 seconds
			result, err := c.rdb.BLPop(ctx, 3*time.Second, c.cfg.RedisQueue).Result()
			if err != nil {
				if err == redis.Nil || strings.Contains(err.Error(), "timeout") {
					continue
				}
				if ctx.Err() != nil {
					return
				}
				log.Printf("[REDIS_POP_ERR] Error popping from queue: %v", err)
				time.Sleep(2 * time.Second)
				continue
			}

			if len(result) < 2 {
				continue
			}

			rawJob := result[1]
			var job TranscodeJob
			if err := json.Unmarshal([]byte(rawJob), &job); err != nil {
				log.Printf("[QUEUE_ERR] Failed to decode job JSON: %v. Raw: %s", err, rawJob)
				continue
			}

			// Acquire worker concurrency slot
			c.semaphore <- struct{}{}
			c.wg.Add(1)
			go func(j TranscodeJob) {
				defer func() {
					<-c.semaphore
					c.wg.Done()
				}()
				_ = c.ProcessJob(context.Background(), j)
			}(job)
		}
	}
}

func (c *Consumer) ProcessJob(ctx context.Context, job TranscodeJob) error {
	if job.JobID == "" {
		job.JobID = uuid.New().String()
	}

	c.totalProcessed.Add(1)
	c.activeJobs.Add(1)
	defer c.activeJobs.Add(-1)

	log.Printf("[JOB_START] Processing transcode job %s for key: %s", job.JobID, job.StorageKey)
	startTime := time.Now()

	// 1. Prepare temp directory
	jobDir := filepath.Join(c.cfg.TempDir, job.JobID)
	rawFilePath := filepath.Join(jobDir, "input_raw.mp4")
	outputHlsDir := filepath.Join(jobDir, "hls")

	defer func() {
		_ = os.RemoveAll(jobDir)
	}()

	// 2. Download raw video from Cloudflare R2 / S3
	if err := c.storage.DownloadFile(ctx, job.StorageKey, rawFilePath); err != nil {
		c.totalFailed.Add(1)
		log.Printf("[JOB_ERR] Failed to download video for job %s: %v", job.JobID, err)
		_ = c.notifier.SendCallback(ctx, job.CallbackURL, webhook.CallbackPayload{
			JobID:        job.JobID,
			LessonID:     job.LessonID,
			Status:       "FAILED",
			ErrorMessage: fmt.Sprintf("Download failed: %v", err),
		})
		return err
	}

	// 3. Transcode to HLS Adaptive Bitrate & Poster Thumbnail
	qualities := job.TargetQualities
	if len(qualities) == 0 {
		qualities = []string{"360p", "720p"}
	}

	watermark := job.WatermarkText
	if watermark == "" {
		watermark = "DMKLab Education K12"
	}

	transcodeRes, err := c.transcoder.TranscodeToHLS(ctx, ffmpeg.TranscodeOptions{
		InputPath:       rawFilePath,
		OutputDir:       outputHlsDir,
		WatermarkText:   watermark,
		Qualities:       qualities,
		SegmentDuration: 6,
	})
	if err != nil {
		c.totalFailed.Add(1)
		log.Printf("[JOB_ERR] Transcoding failed for job %s: %v", job.JobID, err)
		_ = c.notifier.SendCallback(ctx, job.CallbackURL, webhook.CallbackPayload{
			JobID:        job.JobID,
			LessonID:     job.LessonID,
			Status:       "FAILED",
			ErrorMessage: fmt.Sprintf("Transcoding failed: %v", err),
		})
		return err
	}

	// 4. Upload all HLS segments concurrently to Cloudflare R2 / S3
	// Destination remote prefix: hls/<storageKeyWithoutExtension>
	cleanPrefix := strings.TrimSuffix(job.StorageKey, filepath.Ext(job.StorageKey))
	hlsRemotePrefix := fmt.Sprintf("hls/%s", cleanPrefix)

	uploadedCount, err := c.storage.UploadDirectoryConcurrently(ctx, outputHlsDir, hlsRemotePrefix, 8)
	if err != nil {
		c.totalFailed.Add(1)
		log.Printf("[JOB_ERR] Failed to upload HLS files for job %s: %v", job.JobID, err)
		_ = c.notifier.SendCallback(ctx, job.CallbackURL, webhook.CallbackPayload{
			JobID:        job.JobID,
			LessonID:     job.LessonID,
			Status:       "FAILED",
			ErrorMessage: fmt.Sprintf("Upload failed: %v", err),
		})
		return err
	}

	// 5. Build public URLs
	masterKey := fmt.Sprintf("%s/master.m3u8", hlsRemotePrefix)
	posterKey := fmt.Sprintf("%s/poster.jpg", hlsRemotePrefix)
	hlsMasterURL := c.storage.GetPublicCDNURL(masterKey)
	thumbnailURL := c.storage.GetPublicCDNURL(posterKey)

	c.totalSuccess.Add(1)
	elapsed := time.Since(startTime)
	log.Printf("[JOB_SUCCESS] Transcoded & uploaded job %s in %v (Uploaded %d files). Stream URL: %s",
		job.JobID, elapsed, uploadedCount, hlsMasterURL)

	// 6. Notify Spring Boot backend
	_ = c.notifier.SendCallback(ctx, job.CallbackURL, webhook.CallbackPayload{
		JobID:           job.JobID,
		LessonID:        job.LessonID,
		Status:          "COMPLETED",
		HLSMasterURL:    hlsMasterURL,
		ThumbnailURL:    thumbnailURL,
		DurationSeconds: transcodeRes.DurationSeconds,
		UploadedFiles:   uploadedCount,
	})

	return nil
}

func (c *Consumer) GetStats() WorkerStats {
	return WorkerStats{
		TotalProcessed: c.totalProcessed.Load(),
		TotalSuccess:   c.totalSuccess.Load(),
		TotalFailed:    c.totalFailed.Load(),
		ActiveJobs:     c.activeJobs.Load(),
		QueueName:      c.cfg.RedisQueue,
		IsConnected:    c.isConnected.Load(),
	}
}

func (c *Consumer) PushJobToQueue(ctx context.Context, job TranscodeJob) error {
	if job.JobID == "" {
		job.JobID = uuid.New().String()
	}
	bytes, err := json.Marshal(job)
	if err != nil {
		return err
	}
	return c.rdb.RPush(ctx, c.cfg.RedisQueue, string(bytes)).Err()
}

func (c *Consumer) Shutdown() {
	c.wg.Wait()
	if c.rdb != nil {
		_ = c.rdb.Close()
	}
}
