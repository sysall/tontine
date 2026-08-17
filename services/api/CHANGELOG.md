# tontine-api

## 1.0.1-alpha.0

### Patch Changes

- 934f7cf: Run the compiled server in the image instead of recompiling at startup, and read
  Redis credentials from `REDIS_URL` so a hosted instance works.
