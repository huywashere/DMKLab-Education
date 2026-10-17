package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/huywashere/dmklab-video-transcoder/internal/config"
)

type S3Client struct {
	client    *s3.Client
	cfg       *config.Config
	bucket    string
	isLive    bool
	publicURL string
}

func NewS3Client(ctx context.Context, cfg *config.Config) (*S3Client, error) {
	s3Client := &S3Client{
		cfg:       cfg,
		publicURL: strings.TrimRight(cfg.R2PublicURL, "/"),
	}

	if cfg.StorageProvider == "r2" && cfg.IsR2Configured() {
		// Live Cloudflare R2
		endpoint := cfg.GetR2Endpoint()
		customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
			return aws.Endpoint{
				URL:               endpoint,
				SigningRegion:     "auto",
				HostnameImmutable: true,
			}, nil
		})

		awsCfg, err := awsConfig.LoadDefaultConfig(ctx,
			awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.R2AccessKeyID, cfg.R2SecretAccessKey, "")),
			awsConfig.WithEndpointResolverWithOptions(customResolver),
			awsConfig.WithRegion("auto"),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to load R2 AWS config: %w", err)
		}

		s3Client.client = s3.NewFromConfig(awsCfg, func(o *s3.Options) {
			o.UsePathStyle = true
		})
		s3Client.bucket = cfg.R2Bucket
		s3Client.isLive = true
		log.Printf("[STORAGE_R2] Initialized Cloudflare R2 S3 Client: endpoint=%s, bucket=%s", endpoint, cfg.R2Bucket)
	} else if cfg.StorageProvider == "minio" || cfg.S3Endpoint != "" {
		// Local MinIO
		customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
			return aws.Endpoint{
				URL:               cfg.S3Endpoint,
				SigningRegion:     "us-east-1",
				HostnameImmutable: true,
			}, nil
		})

		awsCfg, err := awsConfig.LoadDefaultConfig(ctx,
			awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.S3AccessKey, cfg.S3SecretKey, "")),
			awsConfig.WithEndpointResolverWithOptions(customResolver),
			awsConfig.WithRegion("us-east-1"),
		)
		if err == nil {
			s3Client.client = s3.NewFromConfig(awsCfg, func(o *s3.Options) {
				o.UsePathStyle = true
			})
			s3Client.bucket = cfg.S3Bucket
			s3Client.isLive = true
			log.Printf("[STORAGE_MINIO] Initialized MinIO S3 Client: endpoint=%s, bucket=%s", cfg.S3Endpoint, cfg.S3Bucket)
		}
	}

	if !s3Client.isLive {
		log.Printf("[STORAGE_EMULATION] Running in offline emulation mode for storage operations.")
	}

	return s3Client, nil
}

// DownloadFile downloads object from R2/S3 to a local file
func (s *S3Client) DownloadFile(ctx context.Context, storageKey, localPath string) error {
	if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
		return err
	}

	if s.isLive && s.client != nil {
		resp, err := s.client.GetObject(ctx, &s3.GetObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(storageKey),
		})
		if err != nil {
			return fmt.Errorf("failed to get object from S3/R2: %w", err)
		}
		defer resp.Body.Close()

		outFile, err := os.Create(localPath)
		if err != nil {
			return err
		}
		defer outFile.Close()

		_, err = io.Copy(outFile, resp.Body)
		return err
	}

	// Emulation fallback: write dummy MP4 content if file does not exist
	if _, err := os.Stat(localPath); os.IsNotExist(err) {
		return os.WriteFile(localPath, []byte("EMULATED_RAW_VIDEO_CONTENT_FOR_TESTING"), 0644)
	}
	return nil
}

// UploadFile uploads a single file to R2/S3
func (s *S3Client) UploadFile(ctx context.Context, storageKey, localPath, contentType string) error {
	if contentType == "" {
		contentType = mime.TypeByExtension(filepath.Ext(localPath))
		if contentType == "" {
			contentType = "application/octet-stream"
		}
	}

	if s.isLive && s.client != nil {
		file, err := os.Open(localPath)
		if err != nil {
			return err
		}
		defer file.Close()

		_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(s.bucket),
			Key:         aws.String(storageKey),
			Body:        file,
			ContentType: aws.String(contentType),
		})
		return err
	}

	log.Printf("[STORAGE_MOCK_UPLOAD] Uploaded %s -> %s (%s)", localPath, storageKey, contentType)
	return nil
}

// UploadDirectoryConcurrently uploads all files in a directory concurrently via Goroutines
func (s *S3Client) UploadDirectoryConcurrently(ctx context.Context, localDir, remotePrefix string, concurrency int) (int, error) {
	if concurrency <= 0 {
		concurrency = 8
	}

	type uploadJob struct {
		localPath  string
		storageKey string
	}

	var jobs []uploadJob
	err := filepath.Walk(localDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		relPath, _ := filepath.Rel(localDir, path)
		relPath = filepath.ToSlash(relPath)
		key := fmt.Sprintf("%s/%s", strings.TrimRight(remotePrefix, "/"), relPath)
		jobs = append(jobs, uploadJob{localPath: path, storageKey: key})
		return nil
	})
	if err != nil {
		return 0, err
	}

	jobsChan := make(chan uploadJob, len(jobs))
	for _, j := range jobs {
		jobsChan <- j
	}
	close(jobsChan)

	var wg sync.WaitGroup
	errChan := make(chan error, len(jobs))

	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobsChan {
				select {
				case <-ctx.Done():
					return
				default:
					cType := ""
					if strings.HasSuffix(job.localPath, ".m3u8") {
						cType = "application/vnd.apple.mpegurl"
					} else if strings.HasSuffix(job.localPath, ".ts") {
						cType = "video/MP2T"
					} else if strings.HasSuffix(job.localPath, ".jpg") {
						cType = "image/jpeg"
					}
					if err := s.UploadFile(ctx, job.storageKey, job.localPath, cType); err != nil {
						errChan <- err
					}
				}
			}
		}()
	}

	wg.Wait()
	close(errChan)

	if len(errChan) > 0 {
		return len(jobs) - len(errChan), <-errChan
	}

	return len(jobs), nil
}

func (s *S3Client) GetPublicCDNURL(storageKey string) string {
	cleanKey := strings.TrimLeft(storageKey, "/")
	return fmt.Sprintf("%s/%s", s.publicURL, cleanKey)
}

func (s *S3Client) IsLive() bool {
	return s.isLive
}

var _ = http.StatusOK
