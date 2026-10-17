package cache

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/huywashere/dmklab-ai-proxy/internal/config"
	"github.com/redis/go-redis/v9"
)

type CacheStats struct {
	CacheHits   int64   `json:"cacheHits"`
	CacheMisses int64   `json:"cacheMisses"`
	TokensSaved int64   `json:"tokensSaved"`
	HitRate     float64 `json:"hitRate"`
	IsConnected bool    `json:"isConnected"`
}

type PromptCache struct {
	cfg         *config.Config
	rdb         *redis.Client
	memCache    sync.Map
	cacheHits   atomic.Int64
	cacheMisses atomic.Int64
	tokensSaved atomic.Int64
	isConnected atomic.Bool
}

func NewPromptCache(ctx context.Context, cfg *config.Config) *PromptCache {
	pc := &PromptCache{
		cfg: cfg,
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       0,
	})

	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	if err := rdb.Ping(pingCtx).Err(); err != nil {
		log.Printf("[REDIS_CACHE_WARN] Could not connect to Redis at %s (%v). Using fast in-memory fallback prompt cache.", cfg.RedisAddr, err)
		pc.isConnected.Store(false)
	} else {
		log.Printf("[REDIS_CACHE_CONNECTED] Connected to Redis for Prompt Caching at %s", cfg.RedisAddr)
		pc.isConnected.Store(true)
	}

	pc.rdb = rdb
	return pc
}

// GenerateKey computes a canonical SHA-256 hash for prompt caching
func (c *PromptCache) GenerateKey(prompt, subject string, gradeLevel int, mode string) string {
	normalized := strings.ToLower(strings.TrimSpace(prompt))
	raw := fmt.Sprintf("mode:%s|grade:%d|sub:%s|prompt:%s",
		strings.ToUpper(mode),
		gradeLevel,
		strings.ToLower(strings.TrimSpace(subject)),
		normalized,
	)
	hash := sha256.Sum256([]byte(raw))
	return "cache:ai:prompt:" + hex.EncodeToString(hash[:])
}

// Get retrieves cached Socratic reply
func (c *PromptCache) Get(ctx context.Context, key string) (string, bool) {
	if c.isConnected.Load() && c.rdb != nil {
		val, err := c.rdb.Get(ctx, key).Result()
		if err == nil && val != "" {
			c.cacheHits.Add(1)
			c.tokensSaved.Add(int64(len(val) / 4))
			return val, true
		}
	}

	// Memory fallback
	if val, ok := c.memCache.Load(key); ok {
		if str, ok := val.(string); ok && str != "" {
			c.cacheHits.Add(1)
			c.tokensSaved.Add(int64(len(str) / 4))
			return str, true
		}
	}

	c.cacheMisses.Add(1)
	return "", false
}

// Set stores Socratic reply in cache with TTL
func (c *PromptCache) Set(ctx context.Context, key, reply string) {
	if reply == "" {
		return
	}

	ttl := time.Duration(c.cfg.CacheTTLMinutes) * time.Minute
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}

	if c.isConnected.Load() && c.rdb != nil {
		_ = c.rdb.Set(ctx, key, reply, ttl).Err()
	}

	c.memCache.Store(key, reply)
}

func (c *PromptCache) GetStats() CacheStats {
	hits := c.cacheHits.Load()
	misses := c.cacheMisses.Load()
	total := hits + misses

	var hitRate float64 = 0
	if total > 0 {
		hitRate = float64(hits) / float64(total) * 100.0
	}

	return CacheStats{
		CacheHits:   hits,
		CacheMisses: misses,
		TokensSaved: c.tokensSaved.Load(),
		HitRate:     hitRate,
		IsConnected: c.isConnected.Load(),
	}
}

func (c *PromptCache) Close() {
	if c.rdb != nil {
		_ = c.rdb.Close()
	}
}
