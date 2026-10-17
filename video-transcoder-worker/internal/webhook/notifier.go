package webhook

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type CallbackPayload struct {
	JobID           string  `json:"jobId"`
	LessonID        string  `json:"lessonId"`
	Status          string  `json:"status"` // "COMPLETED" or "FAILED"
	HLSMasterURL    string  `json:"hlsMasterUrl"`
	ThumbnailURL    string  `json:"thumbnailUrl"`
	DurationSeconds float64 `json:"durationSeconds"`
	UploadedFiles   int     `json:"uploadedFiles"`
	ErrorMessage    string  `json:"errorMessage,omitempty"`
}

type Notifier struct {
	client *http.Client
}

func NewNotifier() *Notifier {
	return &Notifier{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (n *Notifier) SendCallback(ctx context.Context, callbackURL string, payload CallbackPayload) error {
	if callbackURL == "" {
		log.Printf("[WEBHOOK] No callback URL provided for job %s, skipping notification.", payload.JobID)
		return nil
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal callback payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, callbackURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create callback request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "DMKLab-VideoTranscoderWorker/1.0")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("callback request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("callback returned HTTP error status %d", resp.StatusCode)
	}

	log.Printf("[WEBHOOK_SUCCESS] Sent callback for job %s to %s (Status: %s)", payload.JobID, callbackURL, payload.Status)
	return nil
}
