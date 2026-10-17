# ==============================================================================
# Multi-Stage Dockerfile for DMKLab Live Gateway & Progress Aggregator (Golang)
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
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /app/live-gateway ./cmd/gateway

# Stage 2: Final Minimal Runner
FROM alpine:3.20 AS runner

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

# Create non-root user
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

COPY --from=builder /app/live-gateway /app/live-gateway

USER appuser

EXPOSE 8087

ENV PORT=8087

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8087/health || exit 1

ENTRYPOINT ["/app/live-gateway"]
