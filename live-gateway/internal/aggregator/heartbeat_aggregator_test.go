package aggregator

import (
	"context"
	"testing"
	"time"

	"github.com/huywashere/dmklab-live-gateway/internal/config"
)

func TestRecordHeartbeatDeduplication(t *testing.T) {
	cfg := &config.Config{
		FlushIntervalSeconds: 60,
		MaxBatchSize:         100,
	}
	agg := NewHeartbeatAggregator(cfg)

	userID := "user-student-123"
	lessonID := "lesson-math-456"

	// Simulate 10 heartbeats sent every 15s by student watching video from 15s to 150s
	for sec := 15; sec <= 150; sec += 15 {
		agg.RecordHeartbeat(HeartbeatRecord{
			UserID:          userID,
			LessonID:        lessonID,
			PositionSeconds: sec,
			DurationSeconds: 180,
			IsCompleted:     sec >= 150,
			LastUpdated:     time.Now(),
		})
	}

	stats := agg.GetStats()
	if stats.HeartbeatsReceived != 10 {
		t.Errorf("Expected 10 received heartbeats, got %d", stats.HeartbeatsReceived)
	}

	// But in pending buffer, there must be only 1 aggregated record!
	if stats.PendingRecords != 1 {
		t.Errorf("Expected 1 deduplicated record in buffer, got %d", stats.PendingRecords)
	}

	// Flush and inspect the single record
	flushedCount := agg.Flush(context.Background())
	if flushedCount != 1 {
		t.Errorf("Expected 1 flushed record, got %d", flushedCount)
	}

	afterStats := agg.GetStats()
	if afterStats.BatchesFlushed != 1 {
		t.Errorf("Expected 1 batch flushed, got %d", afterStats.BatchesFlushed)
	}
	if afterStats.DatabaseWritesSaved != 9 {
		t.Errorf("Expected 9 database writes saved, got %d", afterStats.DatabaseWritesSaved)
	}
	if afterStats.ReductionPercent < 90.0 {
		t.Errorf("Expected >= 90%% database load reduction, got %.2f%%", afterStats.ReductionPercent)
	}
}

func TestMultipleStudentsHeartbeats(t *testing.T) {
	cfg := &config.Config{}
	agg := NewHeartbeatAggregator(cfg)

	// 5 distinct students watching 2 distinct lessons
	for s := 1; s <= 5; s++ {
		agg.RecordHeartbeat(HeartbeatRecord{
			UserID:          "student-" + string(rune('0'+s)),
			LessonID:        "lesson-1",
			PositionSeconds: s * 10,
		})
	}

	stats := agg.GetStats()
	if stats.PendingRecords != 5 {
		t.Errorf("Expected 5 records, got %d", stats.PendingRecords)
	}

	flushed := agg.Flush(context.Background())
	if flushed != 5 {
		t.Errorf("Expected 5 flushed records, got %d", flushed)
	}
}
