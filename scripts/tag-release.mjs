// Tags the version each workspace landed on. Changesets runs this once the
// version PR is merged and no changesets are left; the tags start the Android
// build and the API image. Both workspaces are private, nothing is published.
//
// Only a version the current commit changed gets a tag, so an ordinary push
// doesn't re-release whatever version happens to be sitting in package.json.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const targets = [
  { dir: 'apps/mobile', prefix: 'mobile' },
  { dir: 'services/api', prefix: 'api' },
];

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const versionAt = (ref, dir) => {
  try {
    return JSON.parse(git('show', `${ref}:${dir}/package.json`)).version;
  } catch {
    return null;
  }
};

let pushed = 0;

for (const { dir, prefix } of targets) {
  const { version } = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'));

  if (versionAt('HEAD~1', dir) === version) {
    console.log(`${dir} unchanged at ${version}`);
    continue;
  }

  const tag = `${prefix}-v${version}`;

  if (git('tag', '--list', tag) || git('ls-remote', '--tags', 'origin', tag)) {
    console.log(`${tag} already released`);
    continue;
  }

  git('tag', tag);
  git('push', 'origin', tag);
  console.log(`pushed ${tag}`);
  pushed += 1;
}

if (pushed === 0) console.log('Nothing to tag.');
