#!/usr/bin/env node
/**
 * Guard for `npm run deploy`.
 *
 * `vercel --prod` uploads the working directory, not the committed tree, so it
 * will happily ship code that exists nowhere in git. That has already happened
 * on this project once. Auto-deploy on main is off (vercel.json
 * git.deploymentEnabled), which makes the CLI the normal path to production —
 * so the check that used to be "remember to look at git status" lives here
 * instead.
 *
 * Refuses to deploy unless the working tree is clean and HEAD matches
 * origin/main. Override with ALLOW_DIRTY_DEPLOY=1 when you genuinely mean it.
 */
import { execFileSync } from 'node:child_process'

const BRANCH = 'main'

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

// Same, but returns null instead of throwing. Used for lookups that can
// legitimately fail (e.g. a remote-tracking ref that is missing or corrupt) so
// the guard reports the problem rather than dumping a stack trace.
function gitOrNull(...args) {
  try {
    return git(...args)
  } catch {
    return null
  }
}

function fail(title, detail, remedy) {
  console.error(`\n  ✗ ${title}\n`)
  if (detail) console.error(`${detail}\n`)
  console.error(`  ${remedy}\n`)
  process.exit(1)
}

if (process.env.ALLOW_DIRTY_DEPLOY === '1') {
  console.error('\n  ! ALLOW_DIRTY_DEPLOY=1 — skipping pre-deploy checks.')
  console.error('    Production may not match any commit.\n')
  process.exit(0)
}

// 1. Clean tree. Untracked files count: vercel uploads them too.
const dirty = git('status', '--porcelain')
if (dirty) {
  fail(
    'Working tree is not clean.',
    dirty
      .split('\n')
      .map((l) => `      ${l}`)
      .join('\n'),
    'Commit, stash, or ignore these before deploying — otherwise production ships code that is not in git.',
  )
}

// 2. On the right branch.
const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
if (branch !== BRANCH) {
  fail(`On branch "${branch}", not "${BRANCH}".`, null, `Switch to ${BRANCH} before deploying to production.`)
}

// 3. In sync with the remote, so the deployed SHA is one that actually exists
//    on origin and can be traced back later.
try {
  execFileSync('git', ['fetch', 'origin', BRANCH, '--quiet'], { stdio: 'inherit' })
} catch {
  console.error('  ! Could not reach origin — comparing against the last known remote ref.')
}

const head = git('rev-parse', 'HEAD')
const remote = gitOrNull('rev-parse', `origin/${BRANCH}`)
if (!remote) {
  fail(
    `Cannot resolve origin/${BRANCH}.`,
    '      The remote-tracking ref is missing or corrupt, so there is nothing\n' +
      '      to compare the deploy against.',
    `Repair it with: rm -f .git/refs/remotes/origin/${BRANCH} && git fetch origin --prune`,
  )
}
if (head !== remote) {
  const ahead = git('rev-list', '--count', `origin/${BRANCH}..HEAD`)
  const behind = git('rev-list', '--count', `HEAD..origin/${BRANCH}`)
  fail(
    `HEAD does not match origin/${BRANCH} (ahead ${ahead}, behind ${behind}).`,
    `      local   ${head}\n      remote  ${remote}`,
    ahead !== '0' ? 'Push your commits first, so the deployed code is reviewable on origin.' : 'Pull before deploying.',
  )
}

console.log(`\n  ✓ clean tree, ${BRANCH} @ ${head.slice(0, 7)} in sync with origin — deploying.\n`)
