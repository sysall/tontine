# tontine-mobile

## 1.1.0-alpha.2

### Minor Changes

- Move to Expo SDK 54 with Reanimated 4. The nativewind pin is gone, the worklets
  babel plugin it wanted ships with this stack.

### Patch Changes

- 1293dda: Take every host out of the repo. The app reads `EXPO_PUBLIC_API_URL` from its EAS
  environment, and compose falls back to its own containers only when
  `DATABASE_URL`, `REDIS_URL` or `JWT_SECRET` are unset.

## 1.0.1-alpha.1

### Patch Changes

- b207318: Pin nativewind to the 4.1 line so the app can bundle. 4.2 loads the Reanimated 4
  worklets babel plugin, which doesn't exist on SDK 51.

## 1.0.1-alpha.0

### Patch Changes

- 934f7cf: Point preview and production builds at the deployed API.
