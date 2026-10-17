package com.example.learning.platform.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    public static final String CACHE_GRADES = "grades";
    public static final String CACHE_SUBJECTS = "subjects";
    public static final String CACHE_LESSONS_BY_SUBJECT = "lessons_by_subject";
    public static final String CACHE_LESSON_DETAIL = "lesson_detail";
    public static final String CACHE_LESSON_QUIZ = "lesson_quiz";
    public static final String CACHE_RECENT_LESSONS = "recent_lessons";
    public static final String CACHE_USER_PROFILES = "user_profiles";
    public static final String CACHE_ADMIN_OVERVIEW = "admin_overview";

    private final AtomicLong lastCacheWarningEpoch = new AtomicLong(0);

    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        boolean redisAlive = false;
        try {
            if (connectionFactory != null) {
                var conn = connectionFactory.getConnection();
                conn.ping();
                conn.close();
                redisAlive = true;
            }
        } catch (Exception ex) {
            redisAlive = false;
        }

        if (redisAlive) {
            log.info("[CACHE_INIT] Đã kết nối Redis! Kích hoạt RedisCacheManager phân tán với TTL chuyên biệt.");
            return createRedisCacheManager(connectionFactory);
        } else {
            log.warn("[CACHE_INIT] Redis ngoại tuyến, tự động kích hoạt ConcurrentMapCacheManager (In-Memory RAM) dự phòng.");
            return new ConcurrentMapCacheManager(
                    CACHE_GRADES, CACHE_SUBJECTS, CACHE_LESSONS_BY_SUBJECT,
                    CACHE_LESSON_DETAIL, CACHE_LESSON_QUIZ, CACHE_RECENT_LESSONS,
                    CACHE_USER_PROFILES, CACHE_ADMIN_OVERVIEW
            );
        }
    }

    private RedisCacheManager createRedisCacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType(Object.class)
                .build();
        objectMapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .disableCachingNullValues()
                .prefixCacheNameWith("cache:")
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer));

        // Cấu hình TTL tối ưu riêng cho từng loại dữ liệu K-12
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put(CACHE_GRADES, defaultConfig.entryTtl(Duration.ofHours(24))); // Khối lớp cố định
        cacheConfigs.put(CACHE_SUBJECTS, defaultConfig.entryTtl(Duration.ofHours(12))); // Danh mục môn học
        cacheConfigs.put(CACHE_LESSONS_BY_SUBJECT, defaultConfig.entryTtl(Duration.ofHours(2))); // Danh sách bài học
        cacheConfigs.put(CACHE_LESSON_DETAIL, defaultConfig.entryTtl(Duration.ofHours(2))); // Chi tiết video bài giảng
        cacheConfigs.put(CACHE_LESSON_QUIZ, defaultConfig.entryTtl(Duration.ofHours(2))); // Bộ câu hỏi trắc nghiệm
        cacheConfigs.put(CACHE_RECENT_LESSONS, defaultConfig.entryTtl(Duration.ofMinutes(15))); // Bài mới nhất
        cacheConfigs.put(CACHE_USER_PROFILES, defaultConfig.entryTtl(Duration.ofMinutes(15))); // Hồ sơ người dùng
        cacheConfigs.put(CACHE_ADMIN_OVERVIEW, defaultConfig.entryTtl(Duration.ofSeconds(60))); // Báo cáo KPI quản trị

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }

    /**
     * Bộ xử lý ngoại lệ Cache tự phục hồi (Graceful Degradation):
     * Nếu Redis bị mất kết nối đột ngột lúc runtime, không bao giờ ném lỗi HTTP 500 ra client,
     * mà tự động bỏ qua cache và truy vấn cơ sở dữ liệu PostgreSQL trực tiếp.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                logThrottled("Lỗi đọc cache '" + (cache != null ? cache.getName() : "unknown") + "' (key: " + key + ")", exception);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                logThrottled("Lỗi ghi cache '" + (cache != null ? cache.getName() : "unknown") + "' (key: " + key + ")", exception);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                logThrottled("Lỗi xóa cache '" + (cache != null ? cache.getName() : "unknown") + "' (key: " + key + ")", exception);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                logThrottled("Lỗi xóa toàn bộ cache '" + (cache != null ? cache.getName() : "unknown") + "'", exception);
            }
        };
    }

    private void logThrottled(String message, RuntimeException exception) {
        long now = System.currentTimeMillis();
        long last = lastCacheWarningEpoch.get();
        if (now - last > 60000) {
            if (lastCacheWarningEpoch.compareAndSet(last, now)) {
                log.warn("[CACHE_DEGRADE] {}: {}. Tự động chuyển truy vấn thẳng vào PostgreSQL.", message, exception.getMessage());
            }
        }
    }
}
