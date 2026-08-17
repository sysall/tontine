# tontine-api

## 1.0.1-alpha.1

### Patch Changes

- 1293dda: Take every host out of the repo. The app reads `EXPO_PUBLIC_API_URL` from its EAS
  environment, and compose falls back to its own containers only when
  `DATABASE_URL`, `REDIS_URL` or `JWT_SECRET` are unset.

## 1.0.1-alpha.0

### Patch Changes

- 934f7cf: Run the compiled server in the image instead of recompiling at startup, and read
  Redis credentials from `REDIS_URL` so a hosted instance works.
