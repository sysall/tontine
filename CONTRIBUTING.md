# Contributing

Setting the project up and pointing it at a database or an API is in
[README.md](README.md). This file is about how we work.

## Branches

- `main` — production. Only ever receives a pull request from `alpha`.
- `alpha` — where everything lands first. Versions here carry `-alpha.N`.
- `feat/*`, `fix/*`, `chore/*` — branch off `alpha`, merge back by pull request.

Nobody pushes straight to `main` or `alpha`.

`changeset-release/alpha` belongs to CI. Don't commit to it, just merge it.

## Working on something

```bash
git checkout alpha && git pull
git checkout -b feat/my-thing
```

Before opening the pull request, write a changeset:

```bash
npm run changeset
```

It asks which part you changed and whether it is a patch, minor or major, then
you write one line about the change. Commit that file with your work.

Skip it if you only touched docs or CI. Nothing ships, so there is nothing to
write down.

Open the pull request against `alpha`. Two checks run, one for the API and one
for the app, and both have to be green. Someone else approves it, then it
merges.

## Releasing

1. Your pull requests land on `alpha`.
2. A pull request called **chore: version packages** shows up on its own. It
   bumps the version numbers and writes the changelogs.
3. Merge it. That creates the tags.
4. `mobile-v*` builds the Android APK and puts it on a GitHub release.
   `api-v*` builds the API image and pushes it to GitHub packages.

Only the part you changed gets a tag. If you touched the app and not the API,
only the app is built.

To go from `1.0.1-alpha.3` to a real `1.0.1`, run `npx changeset pre exit` on
`alpha`, then open a pull request from `alpha` to `main`.

## Building an APK without releasing

Go to the Actions tab, pick **Mobile Android build (EAS)**, press **Run
workflow**. It puts the APK on a release called `android-latest`, which always
holds the newest one. Handy for giving someone a build to try.
