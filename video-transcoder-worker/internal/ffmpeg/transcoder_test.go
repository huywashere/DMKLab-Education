package ffmpeg

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestTranscoderToHLS(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "transcode_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	transcoder := NewTranscoder()

	opts := TranscodeOptions{
		InputPath:       "", // tests fallback mock generation
		OutputDir:       filepath.Join(tempDir, "output_hls"),
		WatermarkText:   "DMKLab Education K12",
		Qualities:       []string{"360p", "720p"},
		SegmentDuration: 6,
	}

	res, err := transcoder.TranscodeToHLS(context.Background(), opts)
	if err != nil {
		t.Fatalf("TranscodeToHLS returned unexpected error: %v", err)
	}

	if res == nil {
		t.Fatal("TranscodeResult must not be nil")
	}

	// Verify Master Playlist exists
	if _, err := os.Stat(res.MasterPlaylistPath); os.IsNotExist(err) {
		t.Errorf("Master playlist does not exist at %s", res.MasterPlaylistPath)
	}

	// Verify Master Playlist content has both qualities
	masterBytes, err := os.ReadFile(res.MasterPlaylistPath)
	if err != nil {
		t.Fatalf("failed to read master playlist: %v", err)
	}
	masterStr := string(masterBytes)
	if !strings.Contains(masterStr, "360p/index.m3u8") {
		t.Errorf("Master playlist missing 360p stream: %s", masterStr)
	}
	if !strings.Contains(masterStr, "720p/index.m3u8") {
		t.Errorf("Master playlist missing 720p stream: %s", masterStr)
	}

	// Verify Thumbnail exists
	if _, err := os.Stat(res.ThumbnailPath); os.IsNotExist(err) {
		t.Errorf("Thumbnail poster does not exist at %s", res.ThumbnailPath)
	}

	// Verify segments exist
	if len(res.GeneratedFiles) < 4 {
		t.Errorf("Expected at least 4 generated files, got %d", len(res.GeneratedFiles))
	}
}

func TestQualitySettings(t *testing.T) {
	w, h, bitrate, bw := getQualitySettings("1080p")
	if w != 1920 || h != 1080 || bitrate != "4500k" || bw != 4500000 {
		t.Errorf("Unexpected 1080p settings: w=%d h=%d b=%s bw=%d", w, h, bitrate, bw)
	}

	w, h, _, _ = getQualitySettings("360p")
	if w != 640 || h != 360 {
		t.Errorf("Unexpected 360p settings: w=%d h=%d", w, h)
	}
}
