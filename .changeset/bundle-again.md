---
'tontine-mobile': patch
---

Pin nativewind to the 4.1 line so the app can bundle. 4.2 loads the Reanimated 4
worklets babel plugin, which doesn't exist on SDK 51.
