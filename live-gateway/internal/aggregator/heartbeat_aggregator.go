package aggregator

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/huywashere/dmklab-live-gateway/internal/config"
)

type HeartbeatRecord struct {
	UserID          string    `json:"userId"`
	LessonID        string    `json:"lessonId"`
	PositionSeconds int       `json:"positionSeconds"`
	DurationSeconds int       `json:"durationSeconds"`
	IsCompleted     bool      `json:"isCompleted"`
	LastUpdated     time.Time `json:"lastUpdated"`
}

type AggregatorStats struct {
	HeartbeatsReceived  int64   `json:"heartbeatsReceived"`
	BatchesFlushed      int64   `json:"batchesFlushed"`
	DatabaseWritesSaved int64   `json:"databaseWritesSaved"`
	PendingRecords      int     `json:"pendingRecords"`
	ReductionPercent    float64 `json:"reductionPercent"`
}

type HeartbeatAggregator struct {
	cfg        *config.Config
	buffer     map[string]*HeartbeatRecord
	mu         sync.Mutex
	httpClient *http.Client

	totalReceived atomic.Int64
	totalBatches  atomic.Int64
}

func NewHeartbeatAggregator(cfg *config.Config) *HeartbeatAggregator {
	return &HeartbeatAggregator{
		cfg:    cfg,
		buffer: make(map[string]*HeartbeatRecord),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// RecordHeartbeat adds or updates a student's heartbeat in the memory buffer
func (a *HeartbeatAggregator) RecordHeartbeat(item HeartbeatRecord) {
	if item.UserID == "" || item.LessonID == "" {
		return
	}

	a.totalReceived.Add(1)
	key := fmt.Sprintf("%s:%s", item.UserID, item.LessonID)

	a.mu.Lock()
	defer a.mu.Unlock()

	existing, exists := a.buffer[key]
	if !exists {
		item.LastUpdated = time.Now()
		a.buffer[key] = &item
		return
	}

	// Only advance position forward to prevent race conditions or rewinds
	if item.PositionSeconds > existing.PositionSeconds {
		existing.PositionSeconds = item.PositionSeconds
	}
	if item.IsCompleted {
		existing.IsCompleted = true
	}
	if item.DurationSeconds > 0 {
		existing.DurationSeconds = item.DurationSeconds
	}
	existing.LastUpdated = time.Now()
}

// StartFlushTicker begins the background Write-Behind synchronization loop
func (a *HeartbeatAggregator) StartFlushTicker(ctx context.Context) {
	interval := time.Duration(a.cfg.FlushIntervalSeconds) * time.Second
	if interval <= 0 {
		interval = 60 * time.Second
	}

	ticker := time.NewTicker(interval)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				// Flush remaining before stopping
				a.Flush(context.Background())
				return
			case <-ticker.C:
				a.Flush(ctx)
			}
		}
	}()
	log.Printf("[AGGREGATOR] Started Write-Behind Cache loop: interval=%v, maxBatch=%d", interval, a.cfg.MaxBatchSize)
}

// Flush drains pending records and syncs them in a single batch to backend
func (a *HeartbeatAggregator) Flush(ctx context.Context) int {
	a.mu.Lock()
	if len(a.buffer) == 0 {
		a.mu.Unlock()
		return 0
	}

	// Drain current buffer
	batch := make([]HeartbeatRecord, 0, len(a.buffer))
	for _, rec := range a.buffer {
		batch = append(batch, *rec)
	}
	a.buffer = make(map[string]*HeartbeatRecord)
	a.mu.Unlock()

	a.totalBatches.Add(1)
	count := len(batch)

	// Send batch to Spring Boot backend
	go a.sendBatchToBackend(context.Background(), batch)

	log.Printf("[WRITE_BEHIND_FLUSH] Flushed %d aggregated heartbeats in 1 batch. Total writes saved: %d",
		count, a.totalReceived.Load()-a.totalBatches.Load())

	return count
}

func (a *HeartbeatAggregator) sendBatchToBackend(ctx context.Context, batch []HeartbeatRecord) {
	if a.cfg.BackendSyncURL == "" {
		return
	}

	payload, err := json.Marshal(map[string]interface{}{
		"batchSize": len(batch),
		"records":   batch,
		"timestamp": time.Now().UTC(),
	})
	if err != nil {
		log.Printf("[SYNC_ERR] Failed to marshal batch payload: %v", err)
		return
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.cfg.BackendSyncURL, bytes.NewBuffer(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "DMKLab-LiveGateway/1.0")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		// Log softly - backend might be offline during dev
		log.Printf("[SYNC_LOG] Backend batch webhook endpoint (%s) pending: %v", a.cfg.BackendSyncURL, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 300 {
		log.Printf("[SYNC_SUCCESS] Synchronized %d progress records with Spring Boot.", len(batch))
	}
}

func (a *HeartbeatAggregator) GetStats() AggregatorStats {
	received := a.totalReceived.Load()
	batches := a.totalBatches.Load()
	writesSaved := received - batches
	if writesSaved < 0 {
		writesSaved = 0
	}

	var reduction float64 = 0
	if received > 0 {
		reduction = (float64(writesSaved) / float64(received)) * 100.0
	}

	a.mu.Lock()
	pending := len(a.buffer)
	a.mu.Unlock()

	return AggregatorStats{
		HeartbeatsReceived:  received,
		BatchesFlushed:      batches,
		DatabaseWritesSaved: writesSaved,
		PendingRecords:      pending,
		ReductionPercent:    reduction,
	}
}
