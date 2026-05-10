# Fastcopy Hyperlocal Web-to-Print Marketplace

Fastcopy is a production-grade, hyperlocal Web-to-Print marketplace inspired by SpeedCopy. It connects customers who need fast document printing with verified nearby print vendors, while giving operators an admin layer for approvals, commissions, analytics, disputes, and platform health.

## Architecture Overview

```text
apps/
  web/                 Next.js 15 customer, vendor, and admin frontend
  api/                 Express.js TypeScript backend
packages/
  database/            Mongoose schemas, indexes, repositories
  shared/              Shared DTOs, enums, validation contracts
infra/                 Docker, Nginx, CI/CD, deployment guides
```

### Request Flow

1. Customer uploads a PDF through the Next.js app.
2. Browser validates MIME, magic bytes, and page count using `pdfjs-dist`.
3. Backend revalidates the PDF, recalculates pricing, encrypts metadata, and uploads to S3 using AES-256 server-side encryption.
4. Vendor matching uses MongoDB `2dsphere` indexes to find nearby active vendors with the required capabilities.
5. Orders are paid through Razorpay or Stripe, then emitted over Socket.IO to customer, vendor, and admin rooms.
6. Vendors move orders across Kanban workflow states: `new`, `accepted`, `printing`, `binding`, `ready`, `delivered`.
7. S3 lifecycle rules and background jobs delete delivered files after seven days.

## Engineering Tradeoffs

- **Clean modular monorepo:** keeps frontend, backend, schemas, and deployment assets versioned together while preserving clear package boundaries.
- **Server-authoritative pricing:** client pricing is instant for UX, but backend pricing validation is always authoritative to prevent tampering.
- **Signed URL downloads:** vendors never receive public file URLs; every file access is scoped, expiring, and audited.
- **Geospatial vendor matching:** MongoDB `2dsphere` indexes support practical hyperlocal matching without adding a separate search system initially.
- **Socket.IO rooms:** simple scaling model when paired with Redis adapter, supporting per-order, per-vendor, and admin realtime updates.

## Folder Structure

```text
apps/web/src
  app/                  Next.js App Router pages and route groups
  components/           Reusable UI, upload, dashboard, and motion components
  hooks/                Frontend hooks for sockets, files, pricing, and vendors
  lib/                  API client, auth helpers, PDF engine, utilities
  stores/               Zustand stores

apps/api/src
  config/               Environment, database, Redis, S3, payments
  modules/              Auth, users, vendors, orders, files, payments, notifications, analytics
  realtime/             Socket.IO gateway and events
  jobs/                 File deletion and notification workers
  middleware/           Security, auth, validation, error handling

packages/database/src
  models/               Mongoose schemas and indexes
  repositories/         Query-focused persistence layer

infra
  docker/               Dockerfiles
  nginx/                Reverse proxy and TLS hardening
  github/               CI/CD workflow templates
```

## API Structure

| Method | Path | Purpose | Security |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/otp/request` | Request login OTP | rate limited |
| `POST` | `/api/v1/auth/otp/verify` | Verify OTP and issue tokens | rate limited |
| `POST` | `/api/v1/files/presign` | Create encrypted signed upload target | customer JWT |
| `POST` | `/api/v1/orders/quote` | Server-side authoritative price quote | customer JWT |
| `POST` | `/api/v1/orders` | Create order after payment intent | customer JWT |
| `GET` | `/api/v1/vendors/nearby` | Geospatial vendor search | customer JWT |
| `PATCH` | `/api/v1/vendor/orders/:id/status` | Move Kanban order state | vendor JWT |
| `GET` | `/api/v1/admin/analytics` | Platform metrics | admin JWT |

## Environment Variables

Never hardcode secrets. Copy `.env.example` to the relevant runtime environment and inject values through AWS Secrets Manager, GitHub Actions secrets, or the deployment platform.

## Security Baseline

- Helmet, CORS allowlists, compression, Mongo sanitization, and rate limiting.
- JWT access tokens plus refresh tokens stored in secure, HTTP-only cookies.
- Strict PDF validation: file extension, MIME type, magic bytes, parser verification, and backend page count.
- AES-256/SSE-S3 storage encryption and signed S3 URLs.
- Vendor/admin role-based access control.
- File lifecycle deletion seven days after delivery.

## Deployment Recommendations

- Put Cloudflare in front of Nginx for CDN, WAF, HTTP/3, and DDoS protection.
- Run API and web containers behind Nginx on ECS or EC2 Auto Scaling Groups.
- Use MongoDB Atlas M10+ with automated backups and private networking.
- Use Redis for Socket.IO adapter, queues, OTP throttling, and quote caching.
- Ship logs to CloudWatch/OpenSearch and application traces to OpenTelemetry-compatible backends.
