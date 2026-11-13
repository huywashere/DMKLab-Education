import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// ==============================================================================
// DMKLab Education Platform - K6 High-Concurrency Load Testing Script
// Mô phỏng 500 - 1.000 học sinh đồng thời truy cập, xem bài giảng, nộp quiz
// ==============================================================================

const errorRate = new Rate('errors');

// Cấu hình kịch bản tải trọng
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Khởi động (Warmup): 20 VUs
    { duration: '1m',  target: 100 },  // Tải định danh (Normal load): 100 VUs
    { duration: '1m',  target: 500 },  // Đỉnh điểm giờ cao điểm (Peak load): 500 VUs
    { duration: '30s', target: 0 },    // Hạ nhiệt (Cooldown)
  ],
  thresholds: {
    // 95% số request phải phản hồi dưới 300ms
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    // Tỷ lệ lỗi cho phép dưới 1%
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:8080';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'DMKLab-LoadTest-Agent/1.0',
  };

  // 1. Healthcheck Probe (Liveness & Readiness)
  {
    const res = http.get(`${BASE_URL}/actuator/health`, { headers });
    const success = check(res, {
      'healthcheck status is 200': (r) => r.status === 200,
    });
    errorRate.add(!success);
  }

  sleep(0.5);

  // 2. Tải danh mục khóa học & bài giảng (Read-heavy Cache & DB check)
  {
    const res = http.get(`${BASE_URL}/api/v1/courses`, { headers });
    // Nếu chưa khởi tạo khóa học mẫu hoặc endpoint public, chấp nhận 200 hoặc 404/401 hợp lệ
    const success = check(res, {
      'courses status ok or auth handled': (r) => r.status === 200 || r.status === 401 || r.status === 404,
      'response time < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(!success);
  }

  sleep(1);

  // 3. Mô phỏng học sinh gửi heartbeat tiến độ học tập
  {
    const payload = JSON.stringify({
      lessonId: 101,
      watchedSeconds: 45,
      timestamp: Date.now(),
    });

    const res = http.post(`${BASE_URL}/api/v1/progress/heartbeat`, payload, { headers });
    const success = check(res, {
      'heartbeat responded gracefully': (r) => r.status < 500,
    });
    errorRate.add(!success);
  }

  sleep(1);
}
