package config

import (
	"os"
	"strconv"
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
	return &Config{
		Port:            getEnv("PORT", "8086"),
		OpenAIKey:       getEnv("OPENAI_API_KEY", "mock-key"),
		OpenAIModel:     getEnv("OPENAI_MODEL", "gpt-4o-mini"),
		OpenAIBaseURL:   getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
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
