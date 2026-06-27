# Shipyard Skills — 3-Phase Implementation Plan

Covers the **remaining** skill/plugin work. The product side (handoff page, protocol,
relay route) is already built and verified (`tsc` clean, `next build` passes). These phases
are Markdown + JSON under the repo — the gate is "valid JSON + installs + a real agent can
follow it," **not** `next build`/`next lint`.

Grounds on `skills/SPEC.md` (frozen): §4 layout, §5 skills, §9 distribution, §12.6 CLI side.

## Layout (where things live)

```
<repo root>/
├─ .claude-plugin/
│  └─ marketplace.json        # at repo ROOT — required for `plugin marketplace add <owner>/<repo>`
├─ plugins/
│  └─ shipyard/               # the plugin (referenced by source: "./plugins/shipyard")
│     ├─ .claude-plugin/plugin.json
│     ├─ skills/<6 skills>/SKILL.md
│     └─ reference/{wallet-handoff,trust-boundary,api-surface}.md
└─ skills/                    # internal planning docs only — NOT published in the plugin
   ├─ SPEC.md
   └─ PLAN.md
```

`skills/` holds planning artifacts only; the published plugin is `plugins/shipyard/`.

---

## Phase 1 — Scaffold + shared reference foundation  ✅ DONE (2026-06-27)
*Goal: an installable, valid plugin and the shared docs every skill links to.*

Deliverables:
1. `.claude-plugin/marketplace.json` (repo root) — discovery manifest. ✅
2. `plugins/shipyard/.claude-plugin/plugin.json` — plugin manifest, no MCP for v1. ✅
3. `plugins/shipyard/skills/<6 dirs>/SKILL.md` — valid frontmatter stubs (bodies in Phase 2). ✅
4. `plugins/shipyard/reference/wallet-handoff.md` — §12.6 CLI side: `state` gen, cross-platform
   loopback listener (Windows-aware), relay-poll fallback, envelope decode, security rules. ✅
5. `plugins/shipyard/reference/trust-boundary.md` — the §2 table. ✅
6. `plugins/shipyard/reference/api-surface.md` — §8 headless-vs-popup surface. ✅

Exit criteria:
- Manifests are valid JSON and conform to the plugin schema. ✅
- `plugin marketplace add <repo>` resolves and lists the `shipyard` plugin (stubs OK). ⬜ verify

Open decision (needed before Phase 3 publish, not before now):
- **Repo name for the install string** — package.json says `gendeploy`; product is `shipyard`.
  Goes in README/catalog + the `plugin marketplace add owner/repo` command. Independent of
  `source: "./plugins/shipyard"`.

---

## Phase 2 — Author the skills + real-agent test
*Goal: all six skills written, with a proven end-to-end vertical slice.*

2a — Vertical slice first (de-risks the handoff before bulk authoring):
- Author `deploy-on-shipyard` + `shipyard-networks`, leaning on Phase-1 `wallet-handoff.md`.
- **Real-agent end-to-end test:** prep headless → browser opens prefilled `/handoff` → main-wallet
  popup → approve → CLI auto-resumes from the loopback callback with the contract address. Also
  exercise the **relay** path (Redis-backed). Validates the whole signing model against live code.

2b — Fill out the rest:
- `shipyard-registry`, `interact-with-contracts`, `verify-contract-source`, `using-shipyard`.

Each SKILL.md follows §6: trigger-focused `description`, `allowed-tools`, trust-boundary
callout, wallet-handoff section (gated skills), anti-patterns table, verification section.
**Never** reference a private key/seed; only `qwen/qwen3-coder` named for models.

Exit criteria:
- All 6 skills load and trigger on their intended prompts.
- The deploy slice completes against a live network via the real popup + auto-resume (loopback
  and relay).
- No skill instructs key/seed handling.

---

## Phase 3 — Distribution
*Goal: public discovery + ecosystem reach. (First outward actions — needs explicit go-ahead.)*

Deliverables:
1. Catalog page at `skills.genshipyard.com` (§9) — list + one-line install command + links.
2. Vercel wiring for the subdomain (existing or small new project; no new infra cost).
3. Upstream PR to `genlayerlabs/skills` — same files copied; their README invites it.

Exit criteria:
- Catalog page live; install command works from a clean machine.
- Upstream PR opened.

---

## Cross-cutting constraints
- **Local-first:** nothing pushed or deployed without explicit go-ahead. The Phase 3 catalog
  deploy + upstream PR are the first outward actions.
- Prerequisite already satisfied: providers (`Web3Provider` + `SiweAuthProvider`) wrap the app
  at the root layout, so `/handoff` inherits them.
