# API Integration Guide

## 1. HIBP Authentication
- API key passed via `hibp-api-key` header on every request.
- Custom `user-agent` is REQUIRED by HIBP or requests are rejected.
- Endpoint: `GET /breachedaccount/{email}?truncateResponse=false`
- `404` = clean (no breaches), `200` = breaches found, `429` = rate limited.

## 2. Rate Limiting Strategy (3 layers)
1. **Distributed limiter** (`rate_limiter.py`): Redis-backed global "next-allowed
   timestamp" ensures ALL Celery workers collectively respect ~1 req/1.6s.
2. **24h Caching** (`hibp.py`): every lookup (hit OR empty) is cached in Redis for
   24h keyed by SHA256(email). The same email is never queried twice in a day.
3. **Celery fair dispatch**: `worker_prefetch_multiplier=1` + `task_default_rate_limit`
   prevents burst overload; `429` responses trigger `Retry-After` backoff.

## 3. Idempotent scans
Breaches are keyed by `breach_name` per asset. Re-scans only insert & alert on
NEW breach names — no duplicate notifications.

## 4. Stripe Webhooks
Signature verified with `STRIPE_WEBHOOK_SECRET`. `checkout.session.completed`
upgrades plan → `family`; `subscription.deleted` downgrades → `free`.