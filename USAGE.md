# Usage

Two things live in this repo:

- `apps/mobile` — the phone app, built with Expo
- `services/api` — the API, built with NestJS

## Run it on your machine

```bash
npm install
cp .env.example .env
docker compose up -d
```

That starts Postgres, Redis and the API. Open http://localhost:3000/docs to
check it is up.

Then the app:

```bash
cd apps/mobile
cp .env.example .env
npm start
```

## Point the API at a different database or cache

The API does not know about any provider. It reads these:

| variable | what it is |
| --- | --- |
| `DATABASE_URL` | any Postgres |
| `REDIS_URL` | any Redis. Use this form when there is a password or TLS |
| `JWT_SECRET` | pick your own, the one in `.env.example` is public |
| `NODE_ENV` | set it to `production` outside your machine |
| `PORT` | most hosts set this for you |

Put them in `.env` and compose picks them up. Anything you leave out falls back
to the local containers. So this runs the API alone against a hosted database:

```bash
DATABASE_URL=postgresql://... docker compose up api
```

If Redis is missing the API still works, but it keeps the OTP codes in memory
and loses them on restart.

Set `NODE_ENV=production` anywhere other than your machine. Without it the login
accepts any 6 digit code.

## Point the app at a different API

The URL is not in the repo. It lives in Expo, one value per environment.

```bash
cd apps/mobile
npx eas-cli env:list production
npx eas-cli env:set --name EXPO_PUBLIC_API_URL --value https://your-api/api/v1 --environment production
```

Which environment a build uses comes from `eas.json`:

- `production` and `production-apk` use production
- `preview` uses preview
- `development` uses development

Change the value, build again, done. No commit needed.

For `npm start` on your machine the app reads `apps/mobile/.env` instead, so
everyone can point at whatever they want without bothering the others.

Never put a password or a key in `EXPO_PUBLIC_*`. Anyone with the APK can read
those.

## Day to day

Branch off `alpha`, never off `main`.

```bash
git checkout alpha && git pull
git checkout -b feat/my-thing
```

Before you open the PR, write a changeset:

```bash
npm run changeset
```

It asks which part you changed and whether it is a patch, minor or major, then
you write one line about the change. Commit that file with your work. Skip it if
you only touched docs or CI.

Open the PR against `alpha`. The checks have to be green before it merges.

## Releasing

1. Your PRs land on `alpha`.
2. A PR called **chore: version packages** shows up on its own. It bumps the
   version numbers and writes the changelogs.
3. Merge it. That creates the tags.
4. `mobile-v*` builds the Android APK and puts it on a GitHub release.
   `api-v*` builds the API image and pushes it to GitHub packages.

Only the part you changed gets a tag. If you touched the app and not the API,
only the app is built.

To go from `1.0.1-alpha.3` to a real `1.0.1`, run `npx changeset pre exit` on
`alpha`, then open a PR from `alpha` to `main`.

You can also build an APK whenever you want without releasing. Go to the Actions
tab, pick **Mobile Android build (EAS)**, press **Run workflow**. It puts the APK
on a release called `android-latest`.

## Secrets the repo needs

Settings → Secrets and variables → Actions → New repository secret.

| name | where to get it | what breaks without it |
| --- | --- | --- |
| `EXPO_TOKEN` | expo.dev → account settings → Access Tokens | the APK build cannot log in to Expo |
| `RELEASE_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens. Give it contents, pull requests and workflows, write | the release tags get created but no build starts |

`RELEASE_TOKEN` catches people out. GitHub does not let a workflow start another
workflow with its normal token, so without this one the tag appears and nothing
happens.

Nothing extra is needed for the API image. GitHub handles that itself.

## Settings the repo needs

Settings → Actions → General:

- Workflow permissions: **Read and write**
- Tick **Allow GitHub Actions to create and approve pull requests**

Settings → General:

- Default branch: **alpha**

Settings → Branches, for `main` and `alpha`:

- Require a pull request
- Require the checks to pass
- Require one approval

The default branch matters more than it looks. GitHub reads the workflows from
it, so if it points at a branch without them, the Actions tab looks empty and
the Run workflow buttons are missing.

## Accounts

**Expo.** The app belongs to the `tontine-express` organisation on expo.dev. The
account behind `EXPO_TOKEN` has to be a member of it. That organisation also
holds the Android signing key, so keep `owner` and `projectId` in
`apps/mobile/app.json` exactly as they are. Change them and the next APK is
signed with a new key, and phones refuse to install it over the old one.

**A host for the API.** Anything that runs a container or a Node app works. Give
it the five variables from the table above.

## When something goes wrong

**The Actions tab is empty.** The default branch has no workflows. Set it to
`alpha`.

**The tag is there but nothing built.** `RELEASE_TOKEN` is missing or expired.

**The app cannot reach the API.** Check what the build actually used:
`npx eas-cli env:list production`. The value is baked in when the APK is built,
so changing it needs a new build.

**The API logs say Redis is not running.** Either `REDIS_URL` is wrong, or the
container is running an old image. Rebuild with `docker compose up -d --build api`.

**The APK build fails while bundling.** Try it on your machine first, it is much
faster:

```bash
cd apps/mobile
npx expo export --platform android --output-dir /tmp/check
```
