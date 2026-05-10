# Production Deployment Guide

## AWS Reference Architecture

- Cloudflare terminates public traffic and enforces WAF, bot rules, caching, and DDoS protection.
- Nginx runs as the edge reverse proxy inside ECS, EC2 Auto Scaling, or Kubernetes.
- Next.js web and Express API run as separate containers so they can scale independently.
- MongoDB Atlas stores transactional data with PITR backups, indexes, and private endpoint access.
- Redis powers Socket.IO scaling, OTP throttling, quote caching, and background queue locks.
- S3 stores encrypted PDFs with bucket policies that deny public access and enforce TLS.

## S3 Security and Lifecycle

Configure bucket defaults:

1. Block all public access.
2. Require `aws:SecureTransport` in bucket policy.
3. Enable SSE-S3 or SSE-KMS encryption.
4. Add lifecycle expiration for `uploads/` after seven days as a safety net.
5. Use signed GET URLs with 120 second expiry and signed PUT URLs with 300 second expiry.

## Observability

- Emit structured JSON logs from API containers.
- Track API latency, queue depth, Socket.IO connection count, payment webhook failures, and S3 deletion failures.
- Use OpenTelemetry for traces and CloudWatch alarms for p95 latency and 5xx rates.

## Backup and Recovery

- MongoDB Atlas continuous backups with weekly restore drills.
- Store deployment secrets in AWS Secrets Manager.
- Version S3 bucket only if compliance requires retention; otherwise prefer aggressive lifecycle deletion for privacy.
