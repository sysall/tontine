---
'tontine-api': patch
---

Run the compiled server in the image instead of recompiling at startup, and read
Redis credentials from `REDIS_URL` so a hosted instance works.
