---
'tontine-mobile': patch
'tontine-api': patch
---

Take every host out of the repo. The app reads `EXPO_PUBLIC_API_URL` from its EAS
environment, and compose falls back to its own containers only when
`DATABASE_URL`, `REDIS_URL` or `JWT_SECRET` are unset.
