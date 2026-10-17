# ==============================================================================
# Multi-Stage Dockerfile for DMKLab Video Transcoder Worker (Golang + FFmpeg)
# ==============================================================================

# Stage 1: Builder
FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build binary with CGO disabled for maximum portability and small image size
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /app/video-transcoder ./cmd/worker

# Stage 2: Final Minimal Runner with FFmpeg
FROM alpine:3.20 AS runner

WORKDIR /app

# Install FFmpeg, CA certificates, and fonts for watermarking
RUN apk add --no-cache \
    ffmpeg \
    ca-certificates \
    tzdata \
    ttf-dejavu

# Create non-root user
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

# Create temp transcode directory
RUN mkdir -p /app/temp_transcode && \
    chown -R appuser:appgroup /app

COPY --from=builder /app/video-transcoder /app/video-transcoder

USER appuser

EXPOSE 8085

ENV PORT=8085 \
    TEMP_DIR=/app/temp_transcode

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8085/health || exit 1

ENTRYPOINT ["/app/video-transcoder"]
