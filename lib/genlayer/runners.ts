/**
 * Pinned GenLayer runner hashes.
 * When GenLayer releases a new runner version, update RUNNER_HASH here.
 * Every template, system prompt, and linter reads from this file.
 *
 * Source: https://sdk.genlayer.com/main/impl-spec/appendix/available-runners.html
 * Last verified: June 2026
 */

/** Standard single-file Python Intelligent Contract runner. */
export const RUNNER_HASH = '1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6'

/** Multi-file Python Intelligent Contract runner. */
export const RUNNER_HASH_MULTI = '06zyvrlivjga0d5jlpdbprksc0pa6jmllxvp8s20hq1l512vh5yk'

/** The correct first line for every Intelligent Contract. */
export const CONTRACT_HEADER = `# { "Depends": "py-genlayer:${RUNNER_HASH}" }`

/**
 * Floating tags that are no longer accepted at deploy on any network.
 * Used by the validator to catch contracts written before the pinning requirement.
 */
export const DEPRECATED_FLOATING_TAGS = [
  'py-genlayer:test',
  'py-genlayer:latest',
  'py-genlayer:dev',
]
