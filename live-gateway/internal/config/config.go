package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port                 string
	RedisAddr            string
	RedisPassword        string
	FlushIntervalSeconds int
	MaxBatchSize         int
	BackendSyncURL       string
}

func LoadConfig() *Config {
	return &Config{
		Port:                 getEnv("PORT", "8087"),
		RedisAddr:            getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:        getEnv("REDIS_PASSWORD", ""),
		FlushIntervalSeconds: getEnvAsInt("FLUSH_INTERVAL_SECONDS", 60),
		MaxBatchSize:         getEnvAsInt("MAX_BATCH_SIZE", 500),
		BackendSyncURL:       getEnv("BACKEND_SYNC_URL", "http://backend:8080/api/v1/internal/progress/batch-sync"),
	}
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
