package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port            string
	OpenAIKey       string
	OpenAIModel     string
	OpenAIBaseURL   string
	RedisAddr       string
	RedisPassword   string
	CacheTTLMinutes int
	TypingCadenceMs int
}

func LoadConfig() *Config {
	groqKey := getEnv("GROQ_API_KEY", "")
	geminiKey := getEnv("GEMINI_API_KEY", "")
	openAiKey := getEnv("OPENAI_API_KEY", "")

	apiKey := ""
	model := ""
	defaultBaseURL := "https://generativelanguage.googleapis.com/v1beta/openai"

	if groqKey != "" && strings.HasPrefix(groqKey, "gsk_") {
		apiKey = groqKey
		model = getEnv("GROQ_MODEL", "llama-3.3-70b-versatile")
		defaultBaseURL = "https://api.groq.com/openai/v1"
	} else if geminiKey != "" {
		apiKey = geminiKey
		model = getEnv("GEMINI_MODEL", "gemini-2.5-flash")
		defaultBaseURL = "https://generativelanguage.googleapis.com/v1beta/openai"
	} else if openAiKey != "" {
		apiKey = openAiKey
		model = getEnv("OPENAI_MODEL", "gpt-4o-mini")
		defaultBaseURL = "https://api.openai.com/v1"
	} else {
		apiKey = "mock-key"
		model = "gemini-2.5-flash"
	}

	return &Config{
		Port:            getEnv("PORT", "8086"),
		OpenAIKey:       apiKey,
		OpenAIModel:     model,
		OpenAIBaseURL:   getEnv("OPENAI_BASE_URL", defaultBaseURL),
		RedisAddr:       getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:   getEnv("REDIS_PASSWORD", ""),
		CacheTTLMinutes: getEnvAsInt("CACHE_TTL_MINUTES", 1440),
		TypingCadenceMs: getEnvAsInt("TYPING_CADENCE_MS", 25),
	}
}

func (c *Config) IsLiveOpenAI() bool {
	return c.OpenAIKey != "" && c.OpenAIKey != "mock-key"
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}

func getEnvAsInt(key string, defaultVal int) int {
	if valStr, ok := os.LookupEnv(key); ok && valStr != "" {
		if val, err := strconv.Atoi(valStr); err == nil {
			return val
		}
	}
	return defaultVal
}
