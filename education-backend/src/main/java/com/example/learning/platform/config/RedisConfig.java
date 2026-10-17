package com.example.learning.platform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.util.List;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();

        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    /**
     * Lua Script thực thi nguyên tử (atomic) Sliding Window Counter cho Rate Limiting.
     * Trả về danh sách [currentCount, ttlRemainingSeconds] chỉ trong 1 round-trip duy nhất.
     */
    @Bean
    @SuppressWarnings("rawtypes")
    public RedisScript<List> rateLimitRedisScript() {
        String script =
                "local key = KEYS[1]\n" +
                "local limit = tonumber(ARGV[1])\n" +
                "local window = tonumber(ARGV[2])\n" +
                "\n" +
                "local current = redis.call('INCR', key)\n" +
                "if current == 1 then\n" +
                "    redis.call('EXPIRE', key, window)\n" +
                "end\n" +
                "local ttl = redis.call('TTL', key)\n" +
                "if ttl == -1 then\n" +
                "    redis.call('EXPIRE', key, window)\n" +
                "    ttl = window\n" +
                "end\n" +
                "return {current, ttl}\n";

        return new DefaultRedisScript<>(script, List.class);
    }
}
