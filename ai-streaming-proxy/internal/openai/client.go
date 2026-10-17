package openai

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/huywashere/dmklab-ai-proxy/internal/config"
)

type StreamClient struct {
	cfg        *config.Config
	httpClient *http.Client
}

func NewStreamClient(cfg *config.Config) *StreamClient {
	return &StreamClient{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Stream      bool          `json:"stream"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
}

type StreamChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
}

// StreamCompletion streams tokens from OpenAI or falls back to intelligent Socratic generator
func (c *StreamClient) StreamCompletion(
	ctx context.Context,
	userPrompt, subject string,
	gradeLevel int,
	mode string,
	tokenChan chan<- string,
) error {
	defer close(tokenChan)

	if c.cfg.IsLiveOpenAI() {
		err := c.streamFromOpenAI(ctx, userPrompt, subject, gradeLevel, mode, tokenChan)
		if err == nil {
			return nil
		}
		// Fallback to internal generator on API error
	}

	return c.streamFallbackSocratic(ctx, userPrompt, subject, gradeLevel, mode, tokenChan)
}

func (c *StreamClient) streamFromOpenAI(
	ctx context.Context,
	userPrompt, subject string,
	gradeLevel int,
	mode string,
	tokenChan chan<- string,
) error {
	systemPrompt := fmt.Sprintf(
		"Bạn là Gia sư AI Socratic thông thái của DMKLab Education (K-12 Việt Nam).\n"+
			"Học sinh đang học Lớp %d, môn %s, chế độ '%s'.\n"+
			"Quy tắc Socratic cốt lõi:\n"+
			"1. Tuyệt đối KHÔNG đưa luôn đáp án số học hay bài giải mẫu ăn sẵn.\n"+
			"2. Dẫn dắt bằng cách hỏi ngược lại từng bước logic để học sinh tự suy nghĩ.\n"+
			"3. Giọng văn ấm áp, thân thiện, khích lệ và chuẩn mực sư phạm Việt Nam.",
		gradeLevel, subject, mode,
	)

	reqBody := ChatCompletionRequest{
		Model: c.cfg.OpenAIModel,
		Messages: []ChatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		Stream:      true,
		Temperature: 0.6,
		MaxTokens:   800,
	}

	reqBytes, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}

	url := strings.TrimRight(c.cfg.OpenAIBaseURL, "/") + "/chat/completions"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(reqBytes))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.cfg.OpenAIKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("OpenAI API returned status %d: %s", resp.StatusCode, string(body))
	}

	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}

		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}

		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				break
			}

			var chunk StreamChunk
			if err := json.Unmarshal([]byte(data), &chunk); err == nil {
				if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
					select {
					case <-ctx.Done():
						return ctx.Err()
					case tokenChan <- chunk.Choices[0].Delta.Content:
					}
				}
			}
		}
	}

	return nil
}

// streamFallbackSocratic provides intelligent, pedagogical Socratic guidance when offline or with mock key
func (c *StreamClient) streamFallbackSocratic(
	ctx context.Context,
	userPrompt, subject string,
	gradeLevel int,
	mode string,
	tokenChan chan<- string,
) error {
	cadence := time.Duration(c.cfg.TypingCadenceMs) * time.Millisecond
	if cadence <= 0 {
		cadence = 25 * time.Millisecond
	}

	response := buildSocraticScript(userPrompt, subject, gradeLevel, mode)
	words := strings.Split(response, " ")

	for _, word := range words {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case tokenChan <- word + " ":
			time.Sleep(cadence)
		}
	}

	return nil
}

func buildSocraticScript(prompt, subject string, gradeLevel int, mode string) string {
	lower := strings.ToLower(prompt)

	if strings.Contains(lower, "phương trình") || strings.Contains(lower, "x") {
		return fmt.Sprintf("Chào em! Thầy thấy em đang tìm hiểu về phương trình trong chương trình Lớp %d. "+
			"Theo phương pháp gợi mở Socratic: Trước khi tính toán, em hãy xác định xem: Vế trái và vế phải của phương trình này đang có những hạng tử nào chứa ẩn x? "+
			"Bước đầu tiên, em thử chuyển tất cả các số hạng tự do sang một vế xem nào!", gradeLevel)
	}

	if strings.Contains(lower, "phân số") {
		return fmt.Sprintf("Chào em! Về chủ đề Phân số môn %s Lớp %d: "+
			"Để cộng hoặc trừ hai phân số, điều kiện tiên quyết là gì nhỉ? Em có nhớ hai phân số phải có cùng 'yếu tố' nào ở dưới không? "+
			"Hãy thử tìm mẫu số chung nhỏ nhất của chúng trước nhé!", subject, gradeLevel)
	}

	if strings.Contains(lower, "hình") || strings.Contains(lower, "diện tích") {
		return fmt.Sprintf("Chào em! Khi giải bài toán hình học Lớp %d: "+
			"Em đã vẽ hình ra nháp chưa? Em hãy cho thầy biết hình bài toán cho là hình gì và các kích thước đã biết là bao nhiêu nhé? "+
			"Công thức tính diện tích của hình đó bắt đầu bằng tích của những cạnh nào nào?", gradeLevel)
	}

	return fmt.Sprintf("Thầy chào em! Với câu hỏi về '%s' trong môn %s Lớp %d: "+
		"Thầy rất vui vì em đã chủ động đào sâu kiến thức. "+
		"Thay vì đưa ngay đáp án, thầy muốn em suy nghĩ: Khái niệm này liên hệ trực tiếp với bài học nào em vừa xem trên hệ thống DMKLab? "+
		"Em thử nêu ra một phỏng đoán hoặc bước làm đầu tiên của em xem sao nhé!",
		prompt, subject, gradeLevel)
}
