# ==============================================================================
# Multi-Stage Dockerfile for DMKLab AI Streaming Proxy & Prompt Cache (Golang)
# ==============================================================================

# Stage 1: Builder
FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /app/ai-proxy ./cmd/proxy

# Stage 2: Final Minimal Runner
FROM alpine:3.20 AS runner

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

# Create non-root user
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

COPY --from=builder /app/ai-proxy /app/ai-proxy

USER appuser

EXPOSE 8086

ENV PORT=8086

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8086/health || exit 1

ENTRYPOINT ["/app/ai-proxy"]
