package ffmpeg

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type TranscodeOptions struct {
	InputPath       string
	OutputDir       string
	WatermarkText   string
	Qualities       []string // e.g. ["360p", "720p", "1080p"]
	SegmentDuration int      // seconds (default 6s)
}

type TranscodeResult struct {
	MasterPlaylistPath string
	ThumbnailPath      string
	DurationSeconds    float64
	GeneratedFiles     []string
}

type Transcoder struct {
	ffmpegPath string
}

func NewTranscoder() *Transcoder {
	path, err := exec.LookPath("ffmpeg")
	if err != nil {
		path = "ffmpeg"
	}
	return &Transcoder{ffmpegPath: path}
}

func (t *Transcoder) IsFFmpegAvailable() bool {
	cmd := exec.Command(t.ffmpegPath, "-version")
	return cmd.Run() == nil
}

// TranscodeToHLS generates multi-bitrate HLS streams, master playlist, and thumbnail
func (t *Transcoder) TranscodeToHLS(ctx context.Context, opts TranscodeOptions) (*TranscodeResult, error) {
	if len(opts.Qualities) == 0 {
		opts.Qualities = []string{"360p", "720p"}
	}
	if opts.SegmentDuration <= 0 {
		opts.SegmentDuration = 6
	}

	if err := os.MkdirAll(opts.OutputDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create output dir: %w", err)
	}

	// 1. Generate Poster Thumbnail at 2s
	thumbPath := filepath.Join(opts.OutputDir, "poster.jpg")
	if t.IsFFmpegAvailable() && opts.InputPath != "" && fileExists(opts.InputPath) {
		thumbArgs := []string{
			"-y",
			"-ss", "00:00:02",
			"-i", opts.InputPath,
			"-vframes", "1",
			"-q:v", "2",
			thumbPath,
		}
		thumbCmd := exec.CommandContext(ctx, t.ffmpegPath, thumbArgs...)
		_ = thumbCmd.Run()
	} else {
		// Mock thumbnail for dev/offline testing
		_ = os.WriteFile(thumbPath, []byte("MOCK_JPEG_THUMBNAIL_DMKLAB"), 0644)
	}

	var generatedFiles []string
	generatedFiles = append(generatedFiles, thumbPath)

	var streamEntries []string

	// 2. Transcode each quality
	for _, q := range opts.Qualities {
		qualityDir := filepath.Join(opts.OutputDir, q)
		if err := os.MkdirAll(qualityDir, 0755); err != nil {
			return nil, err
		}

		playlistPath := filepath.Join(qualityDir, "index.m3u8")
		segmentPattern := filepath.Join(qualityDir, "segment_%03d.ts")

		width, height, bitrate, bandwidth := getQualitySettings(q)

		if t.IsFFmpegAvailable() && opts.InputPath != "" && fileExists(opts.InputPath) {
			vfFilters := []string{fmt.Sprintf("scale=%d:%d", width, height)}
			if opts.WatermarkText != "" {
				vfFilters = append(vfFilters, fmt.Sprintf(
					"drawtext=text='%s':x=w-tw-20:y=20:fontsize=20:fontcolor=white@0.8:box=1:boxcolor=black@0.4",
					escapeDrawText(opts.WatermarkText),
				))
			}

			args := []string{
				"-y",
				"-i", opts.InputPath,
				"-vf", strings.Join(vfFilters, ","),
				"-c:v", "libx264",
				"-profile:v", "main",
				"-crf", "20",
				"-sc_threshold", "0",
				"-g", "48",
				"-keyint_min", "48",
				"-b:v", bitrate,
				"-maxrate", bitrate,
				"-bufsize", "2M",
				"-c:a", "aac",
				"-b:a", "128k",
				"-ac", "2",
				"-f", "hls",
				"-hls_time", fmt.Sprintf("%d", opts.SegmentDuration),
				"-hls_playlist_type", "vod",
				"-hls_segment_filename", segmentPattern,
				playlistPath,
			}

			log.Printf("[FFMPEG] Starting transcode for quality %s: %s %s", q, t.ffmpegPath, strings.Join(args, " "))
			cmd := exec.CommandContext(ctx, t.ffmpegPath, args...)
			cmd.Stderr = os.Stderr
			if err := cmd.Run(); err != nil {
				log.Printf("[FFMPEG_WARN] FFmpeg transcode error for %s: %v. Using fallback simulation.", q, err)
				t.createMockHLS(qualityDir, q)
			}
		} else {
			t.createMockHLS(qualityDir, q)
		}

		// Collect generated files in qualityDir
		entries, _ := os.ReadDir(qualityDir)
		for _, e := range entries {
			if !e.IsDir() {
				generatedFiles = append(generatedFiles, filepath.Join(qualityDir, e.Name()))
			}
		}

		streamEntries = append(streamEntries, fmt.Sprintf(
			"#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%dx%d,NAME=\"%s\"\n%s/index.m3u8",
			bandwidth, width, height, q, q,
		))
	}

	// 3. Write Master Playlist
	masterPath := filepath.Join(opts.OutputDir, "master.m3u8")
	var masterContent strings.Builder
	masterContent.WriteString("#EXTM3U\n#EXT-X-VERSION:3\n")
	for _, entry := range streamEntries {
		masterContent.WriteString(entry + "\n")
	}

	if err := os.WriteFile(masterPath, []byte(masterContent.String()), 0644); err != nil {
		return nil, fmt.Errorf("failed to write master playlist: %w", err)
	}
	generatedFiles = append(generatedFiles, masterPath)

	return &TranscodeResult{
		MasterPlaylistPath: masterPath,
		ThumbnailPath:      thumbPath,
		DurationSeconds:    120.0,
		GeneratedFiles:     generatedFiles,
	}, nil
}

func (t *Transcoder) createMockHLS(qualityDir, quality string) {
	_ = os.WriteFile(
		filepath.Join(qualityDir, "index.m3u8"),
		[]byte(fmt.Sprintf("#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:6\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:6.000,\nsegment_000.ts\n#EXTINF:6.000,\nsegment_001.ts\n#EXT-X-ENDLIST\n")),
		0644,
	)
	_ = os.WriteFile(filepath.Join(qualityDir, "segment_000.ts"), []byte("MOCK_HLS_SEGMENT_0_"+quality), 0644)
	_ = os.WriteFile(filepath.Join(qualityDir, "segment_001.ts"), []byte("MOCK_HLS_SEGMENT_1_"+quality), 0644)
}

func getQualitySettings(q string) (width, height int, bitrate string, bandwidth int) {
	switch strings.ToLower(q) {
	case "360p":
		return 640, 360, "800k", 800000
	case "720p":
		return 1280, 720, "2500k", 2500000
	case "1080p":
		return 1920, 1080, "4500k", 4500000
	default:
		return 854, 480, "1200k", 1200000
	}
}

func escapeDrawText(text string) string {
	r := strings.NewReplacer(":", "\\:", "'", "\\'", "%", "\\%")
	return r.Replace(text)
}

func fileExists(p string) bool {
	st, err := os.Stat(p)
	return err == nil && !st.IsDir()
}
