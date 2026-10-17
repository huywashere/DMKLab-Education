package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port              string
	RedisAddr         string
	RedisPassword     string
	RedisQueue        string
	StorageProvider   string
	R2AccountID       string
	R2Bucket          string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2PublicURL       string
	S3Endpoint        string
	S3Bucket          string
	S3AccessKey       string
	S3SecretKey       string
	MaxConcurrentJobs int
	TempDir           string
}

func LoadConfig() *Config {
	return &Config{
		Port:              getEnv("PORT", "8085"),
		RedisAddr:         getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:     getEnv("REDIS_PASSWORD", ""),
		RedisQueue:        getEnv("REDIS_QUEUE", "queue:video:transcode"),
		StorageProvider:   getEnv("STORAGE_PROVIDER", "r2"),
		R2AccountID:       getEnv("R2_ACCOUNT_ID", ""),
		R2Bucket:          getEnv("R2_BUCKET", "education-media"),
		R2AccessKeyID:     getEnv("R2_ACCESS_KEY_ID", ""),
		R2SecretAccessKey: getEnv("R2_SECRET_ACCESS_KEY", ""),
		R2PublicURL:       getEnv("R2_PUBLIC_URL", "https://media.dmklab.edu.vn"),
		S3Endpoint:        getEnv("S3_ENDPOINT", "http://localhost:9000"),
		S3Bucket:          getEnv("S3_BUCKET", "education-media"),
		S3AccessKey:       getEnv("S3_ACCESS_KEY", "minioadmin"),
		S3SecretKey:       getEnv("S3_SECRET_KEY", "minioadmin"),
		MaxConcurrentJobs: getEnvAsInt("MAX_CONCURRENT_JOBS", 2),
		TempDir:           getEnv("TEMP_DIR", "temp_transcode"),
	}
}

func (c *Config) GetR2Endpoint() string {
	if c.R2AccountID != "" {
		return fmt.Sprintf("https://%s.r2.cloudflarestorage.com", c.R2AccountID)
	}
	return ""
}

func (c *Config) IsR2Configured() bool {
	return c.R2AccountID != "" && c.R2AccessKeyID != "" && c.R2SecretAccessKey != ""
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
