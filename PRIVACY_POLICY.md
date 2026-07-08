# Privacy & Data Retention

## What we store
- **Monitored emails**: encrypted at rest with Fernet (AES-128-CBC + HMAC).
  A separate SHA-256 hash is stored ONLY for deduplication/lookup.
- **Breach records**: we persist only PUBLIC breach *metadata* and the
  *categories* of leaked data (e.g. "Passwords") — never the leaked
  passwords, card numbers, or other raw PII values.

## What we DON'T store
- No plaintext monitored emails.
- No leaked credentials or raw breach dump contents.

## Retention
- Breach metadata retained while the asset is monitored; deleted (cascade)
  when a user removes an asset or deletes their account.
- Redis cache entries auto-expire after 24h.

## Anti-abuse / Anti-stalking
- Ownership of every monitored email is verified via a signed, time-limited
  confirmation link BEFORE any scanning occurs.