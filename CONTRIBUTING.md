# Contributing

## Branches

- `main` — production. Protected: PR only, green CI, one review.
- `alpha` — where everything lands first. Versions carry `-alpha.N`.
- `feat/*`, `fix/*`, `chore/*` — branch off `alpha`, merge back by PR.

No direct pushes to `main` or `alpha`. `main` only receives a PR from `alpha`.

`changeset-release/alpha` is maintained by CI. Don't commit to it, just merge it.

## Changesets

```bash
npm run changeset
```

Pick the workspaces you touched (`tontine-mobile`, `tontine-api`), pick
patch/minor/major, write one line for the changelog. Commit the file in
`.changeset/` with your work.

CI config, docs and formatting don't need one.

## CI

Every PR into `main` or `alpha` runs `.github/workflows/ci.yml`: the API is
typechecked and built after the Prisma client is generated, the mobile app is
typechecked. Both jobs green to merge.

## Releasing

1. PRs merge into `alpha`, each with its changeset.
2. Every push to `alpha` re-runs the gate and then opens or updates the
   **Version Packages** PR with the bumps and changelog entries.
3. Merging it bumps the versions and pushes `mobile-v<version>` /
   `api-v<version>`, only for the workspace that changed.
4. `mobile-v*` builds the Android APK on EAS and attaches it to a GitHub
   Release. `api-v*` pushes the API image to `ghcr.io/<owner>/tontine-api`.

The tag is the release; nothing goes to a package registry.

To promote to stable, PR `alpha` into `main`. `npx changeset pre exit` is what
turns `1.2.0-alpha.3` into `1.2.0`.

Both build workflows also have a **Run workflow** button. Run by hand, the
Android one refreshes the `android-latest` release instead of cutting a new one,
which is how you hand a tester an APK.

## Secrets and setup

| name | used by | what it is |
| --- | --- | --- |
| `EXPO_TOKEN` | `mobile-android.yml` | access token for the Expo account owning the EAS project (expo.dev -> account settings -> Access Tokens) |
| `RELEASE_TOKEN` | `release.yml` | PAT with `repo` + `workflow`. A tag pushed with the default `GITHUB_TOKEN` doesn't start another workflow, so without this the APK and image builds never fire from a release. It also lets the version PR be opened when Actions aren't allowed to create PRs |

GHCR uses `GITHUB_TOKEN`, nothing to set up there.

`eas init` from `apps/mobile` writes `expo.extra.eas.projectId` into `app.json`.

## Pointing at different infrastructure

The API names no provider. It reads five variables and works against whatever
they point at, local containers or managed services:

| variable | note |
| --- | --- |
| `DATABASE_URL` | any Postgres Prisma can reach |
| `REDIS_URL` | use this for anything with a password or TLS (`rediss://`). `REDIS_HOST`/`REDIS_PORT` cover an unauthenticated local instance |
| `JWT_SECRET` | the one in `.env.example` is public |
| `NODE_ENV` | anything other than `production` makes `verifyOtp` accept any 6-digit code |
| `PORT` | most platforms set it for you |

Copy `.env.example` to `.env` and override what you need. `docker-compose.yml`
falls back to its own containers when a variable is unset, so
`DATABASE_URL=... docker compose up api` runs the API alone against a managed
database.

Without Redis the API keeps OTPs in memory. Fine locally, lost on every restart.

## Which API the app talks to

A build reads `EXPO_PUBLIC_API_URL` from the EAS environment its profile names:
`production` and `production-apk` from production, `preview` from preview,
`development` from development. Moving the app to a different API is one command
and a rebuild, with no commit:

```bash
cd apps/mobile
npx eas-cli env:list production
npx eas-cli env:set --name EXPO_PUBLIC_API_URL --value https://… --environment production
```

The value ships inside the APK and anyone holding it can read it, so keep
secrets out of `EXPO_PUBLIC_*`.

Running the dev server is per-developer: copy `apps/mobile/.env.example` to
`.env` and point `EXPO_PUBLIC_API_URL` at localhost, your LAN address, or a
tunnel to your machine. `.env` is ignored, so nobody else inherits your setup.
