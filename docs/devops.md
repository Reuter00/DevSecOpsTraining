# DevOps quickstart

## Setup
- Copy `.env.example` to `.env` and change secrets (`JWT_SECRET`, DB passwords, Grafana/PgAdmin credentials).
- Start the stack: `docker-compose up -d postgres devsecops frontend pgadmin postgres_exporter prometheus grafana`.
- Health endpoints: API `/readyz` (readiness) and `/` (liveness); Postgres health handled via `pg_isready`.

Prometheus note: host port defaults to `${PROMETHEUS_PORT:-9091}` to avoid conflicts; override by exporting `PROMETHEUS_PORT` before `docker-compose up`.

## Observability
- Prometheus scrapes the API (`devsecops:3000/readyz`) and Postgres metrics via `postgres_exporter:9187`.
- Grafana available on `http://localhost:3001` (default admin from `.env`). Add Prometheus datasource at `http://prometheus:9090`.

## Security + secrets
- Secrets live in `.env` (gitignored); rotate defaults in `.env.example`.
- CI security checks: `npm audit --audit-level=high`, Gitleaks, and Trivy FS scan (`.github/workflows/security.yml` and `ci.yml`).

## Testing
- Install deps: `npm ci`.
- Run unit/integration tests: `npm test` (uses Jest + Supertest, no DB needed).

## Backups (manual starter)
- Local Postgres backup: `docker exec devsecops_postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backups/devdb.sql` (ensure `backups/` is gitignored).
