# Shipyard Skills — Specification (draft)

**Status:** 🧊 FROZEN (2026-06-27) — implementation in progress (handoff flow). Change via follow-up revision only.
**Date:** 2026-06-27
**Goal:** Teach agents (and humans-in-the-loop) the full Shipyard journey — **deploy → discover → interact → verify** — as a Claude Code plugin of focused skills, hosted in-repo, browsable at `skills.genshipyard.com`, and (later) mirrored to the official `genlayerlabs/skills` marketplace.

**Signing model:** users always sign with their **own main wallet** via a real **wallet popup**, triggered through a **browser handoff with a `127.0.0.1` loopback callback** (the `vercel login` / `gh auth login` pattern), with a **relay fallback** for remote/SSH sessions (§12.1). The CLI agent never holds a key and never signs. **No throwaway keys.** No network restrictions — mainnet/Clarke included — because a human approves every signature.

---

## 1. Decisions already settled

| Question | Decision | Why |
|---|---|---|
| Format | Claude Code plugin / `SKILL.md` (plain Markdown) | Free (no API), matches `genlayerlabs/skills`, installable via `plugin marketplace add`. Not Anthropic lock-in — readable by anyone. |
| Cost | $0 to author/host/distribute | A skill is text + files. Only *running* an agent costs, and that's the consumer's choice (and you're already on Claude Code). |
| Shape | One plugin `shipyard` containing several small skills | Mirrors `genlayer-dev` (5 skills). One skill = one job. |
| Relationship to GenLayer skills | **Pair with, don't duplicate** | GenLayer already ships `write-contract`, `genlayer-cli`, etc. Shipyard's value is the **no-CLI browser flow**; defer contract authoring to GenLayer. |
| Feasibility model | **Operator guidance with an explicit trust boundary** | Robust, runtime-agnostic, safe. Not silent key signing. |
| Signing | **Main wallet, real popup, via browser handoff + localhost callback** (Option A) | Key never leaves the wallet; reuses Shipyard's existing wagmi + RainbowKit; works on any network; no throwaway keys. |
| Publishing | Self-host in repo + `skills.genshipyard.com` first, then PR upstream to `genlayerlabs/skills` | You own brand/timeline; upstream later is a file copy (same format). |

---

## 2. The trust boundary (code-grounded)

The boundary **maps 1:1 onto Shipyard's own gates** — traceable to source, not a judgment call. Signing always happens in the user's wallet; the agent does everything up to the popup, then resumes from the result.

| Action | Gate in code | Signature type | On-chain / gas? | Agent autonomy |
|---|---|---|---|---|
| Read methods | `components/interact/ReadMethods.tsx` — no gate | none | no | **Fully autonomous** |
| Browse / find in registry | read-only | none | no | **Fully autonomous** |
| Verify — **authenticity** | `app/api/verify/route.ts` requires a SIWE session | off-chain SIWE message | **no (gasless)** | Prep autonomous → **wallet popup** to sign in |
| Verify — **attribution to your wallet** | attribution credited only if deployer == session wallet (`route.ts:108-119`) | off-chain SIWE by the deployer wallet | no | **wallet popup** with the deploying wallet |
| Write methods | `components/interact/WriteMethods.tsx:74` → "Connect wallet to execute" | on-chain tx | **yes (gas)** | Prep autonomous → **wallet popup** to sign |
| Deploy | `components/deploy/DeployForm.tsx:146` → "Connect wallet to deploy" | on-chain tx | **yes (gas)** | Prep autonomous → **wallet popup** to sign |

**Rule for every skill:** *the agent prepares everything that needs no key, triggers the user's wallet popup via the handoff (§3), and resumes from the returned result.* Reads never trigger a popup.

### Verify is NOT a chain transaction (confirmed in code)
- **Authenticity is trustless:** the server compares submitted source to the real on-chain code (`getOnChainCode` on studionet/localnet) or to the code embedded in the deploy tx (Bradbury/Asimov). No signature proves authenticity.
- **The only auth is a SIWE session** (`getSession()` → 401 if absent). SIWE = one **off-chain, gasless** message signature exchanged for a JWT cookie (`lib/auth/session.ts`, `app/api/auth/nonce|verify/route.ts`).
- **Attribution** to your wallet requires the signed-in wallet to equal the deploy-tx sender. A non-deployer can still verify *authenticity* (unattributed) — graceful fallback.
- Implication: verify is the **cheapest** gated action (gasless) — still a real popup, but a sign-in message, not a spend.

---

## 3. Signing handoff — main wallet, real popup (Option A)

**The popup comes from the user's wallet, not the CLI.** The agent requests a signature; the user approves in their own wallet (browser extension *or* WalletConnect mobile — whatever they already use). The key never touches the CLI.

### Flow (every wallet-gated step: deploy / write / verify)
1. **Prepare headlessly** — validate contract, choose network, fill params; compute everything that needs no key.
2. **Open browser handoff + start a loopback listener** — agent opens a prefilled Shipyard `/handoff` URL and listens on `http://127.0.0.1:<port>` (literal `127.0.0.1`, not `localhost` — §12.4 #4).
3. **Wallet popup** — the Shipyard page triggers the normal RainbowKit popup; user approves with their **main wallet** on **any network**.
4. **Return the result** — the page sends the result (tx hash / contract address / verified+attributed status) back to the CLI: by navigating to the `127.0.0.1` callback (loopback) or via the relay endpoint (remote/SSH). See §12.1–12.3.
5. **Auto-resume** — the agent continues (read result, confirm on registry). No copy-paste.

User experience: *terminal says "approve in your browser" → browser opens → wallet popup → click Approve → terminal continues.*

### Fallbacks (the skills must handle)
- **Remote / SSH / port-bind blocked:** the loopback can't be reached, so the skill uses the **relay transport** (Shipyard stores the result; the CLI polls) — the primary, built-in fallback (§12.1).
- **No transport at all (last resort):** the page shows the tx hash / status for the user to paste back; agent resumes from the paste. (Same boundary, manual return.)
- **Computer-use / Playwright runtime:** the agent drives the prefilled page itself and pauses for the human to approve the wallet popup. Identical boundary.

### The one true limitation (by design)
A signature always needs the human to click **Approve** at that moment. Silent signing with the main wallet is impossible without leaking the key — and is explicitly *not* a goal. "Popup on demand" = yes; "sign without me" = no.

### What already exists vs. what to build (product side — you own this)
- **Exists:** deploy source prefill — `handleShareSource` builds `"/deploy?source=" + LZString.compressToEncodedURIComponent(source)` (`components/interact/ContractPanel.tsx`).
- **Exists:** manual deploy-tx entry in verify, "for contracts deployed elsewhere, e.g. via the CLI" — lets any deploy flow later claim attribution.
- **Exists:** SIWE endpoints (`/api/auth/nonce`, `/api/auth/verify`) and the session model.
- **To build:** a **handoff flow** (additive `/handoff` page; see §12) that (a) accepts the full prefill (network + constructor params + action type, not just source) and (b) returns the result to the CLI via a `127.0.0.1` loopback callback or the relay endpoint after the popup resolves. This is the only new product piece; it makes the CLI seamless.

---

## 4. Repo layout (matches `genlayerlabs/skills` conventions)

```
shipyard/                              (existing repo root)
├─ .claude-plugin/
│  └─ marketplace.json                 # discovery manifest (root = installable via `add luch91/shipyard`)
└─ plugins/
   └─ shipyard/                        # the plugin (the "subfolder")
      ├─ .claude-plugin/
      │  └─ plugin.json
      ├─ skills/
      │  ├─ using-shipyard/SKILL.md            # entry-point / journey map (router)
      │  ├─ deploy-on-shipyard/SKILL.md        # wallet popup
      │  ├─ shipyard-registry/SKILL.md         # autonomous (read)
      │  ├─ interact-with-contracts/SKILL.md   # read autonomous; write → wallet popup
      │  ├─ verify-contract-source/SKILL.md    # wallet popup (gasless SIWE)
      │  └─ shipyard-networks/SKILL.md         # reference (autonomous)
      └─ reference/
         ├─ wallet-handoff.md                  # shared: the §3 popup handoff + callback
         ├─ trust-boundary.md                  # shared: the §2 table
         └─ api-surface.md                     # what's callable headlessly vs browser-only (§8)
```

**Alternative considered:** a dedicated `luch91/shipyard-skills` repo (keeps the Next.js app clean, like `genlayerlabs/skills` is its own repo). Default = in-repo per your preference.

### `marketplace.json` (shape)
```json
{
  "name": "shipyard",
  "owner": { "name": "Shipyard" },
  "plugins": [
    { "name": "shipyard", "source": "./plugins/shipyard",
      "description": "Deploy, discover, and interact with GenLayer Intelligent Contracts via Shipyard — no CLI." }
  ]
}
```

### `plugin.json` (shape)
```json
{
  "name": "shipyard",
  "version": "0.1.0",
  "description": "Deploy, discover, and interact with GenLayer Intelligent Contracts via Shipyard.",
  "mcpServers": { }
}
```
> Optional: GenLayer wires `genlayer-docs` (SSE MCP) in their `plugin.json`. We can add a Shipyard docs MCP later, or reference `docs.genlayer.com` directly. Not required for v1.

---

## 5. The skills

Each skill: a sharp `description` (the trigger), `allowed-tools`, a short procedural body, detail in `reference/`. Every wallet-gated skill links `reference/wallet-handoff.md` and uses the §3 popup handshake.

### 5.1 `using-shipyard` (entry point / router)
- **Trigger:** "deploy with shipyard", "use genshipyard", "deploy/interact with a GenLayer contract via Shipyard".
- **Does:** explains the journey (deploy → discover → interact → verify), the signing model in one line (main wallet, popup), routes to the right sub-skill. Pairs with GenLayer's `write-contract` for authoring.
- **Autonomy:** N/A (guidance).

### 5.2 `deploy-on-shipyard`  *(wallet popup)*
- **Trigger:** "deploy a contract on shipyard / to Bradbury/Asimov/Studionet/Localnet".
- **Does:** validate `.py` contract, pick network, fill constructor params → **handoff: wallet popup to sign the deploy tx** → resume with contract address + read the deploy log.
- **Boundary:** on-chain tx; user signs in their wallet (any network).
- **allowed-tools (proposed):** `Read, Grep, Glob, WebFetch, Bash` (Bash to open the handoff URL + run the localhost callback listener; WebFetch for read-back).

### 5.3 `shipyard-registry`  *(autonomous)*
- **Trigger:** "find a contract in the registry", "is this contract verified", "list contracts on <network>".
- **Does:** browse/search the registry; read addresses, method chips, verified status, network badges. No wallet, no popup.
- **allowed-tools:** `WebFetch, Bash, Read`.

### 5.4 `interact-with-contracts`  *(read autonomous; write → wallet popup)*
- **Trigger:** "call a method on contract X", "read get_balance", "write/transfer on contract X".
- **Does:** parse contract methods; **read** methods run autonomously and return results; **write** methods prepare params → **handoff: wallet popup to sign** → resume with tx hash.
- **Boundary:** read = open; write = on-chain tx, user signs.
- **allowed-tools:** `WebFetch, Bash, Read`.

### 5.5 `verify-contract-source`  *(wallet popup, gasless)*
- **Trigger:** "verify and publish my contract source", "attribute this contract to my wallet".
- **Does:** check status (`GET /api/verify`); prepare source (+ deploy tx for attribution) → **handoff: wallet popup for the SIWE sign-in (gasless)** → `POST /api/verify` → resume confirming verified + attribution.
- **Boundary:** off-chain SIWE message (no gas). Authenticity works for any signed-in wallet; attribution needs the deploying wallet.
- **allowed-tools:** `Read, WebFetch, Bash`.

### 5.6 `shipyard-networks`  *(reference, autonomous)*
- **Trigger:** loaded by the others; also "which Shipyard network should I use", "shipyard faucet".
- **Does:** Bradbury (primary), Asimov, Studionet, Localnet, Clarke ("Soon"); when to use which; faucet (`FaucetWidget`); **model constraint: only `qwen/qwen3-coder` works on OpenRouter** (don't suggest unverified model IDs); wallet/connect requirements.

---

## 6. Content conventions (per `SKILL.md`)
- Frontmatter: `name`, `description` (trigger-focused, names "Shipyard" + "GenLayer Intelligent Contract"), `allowed-tools`.
- Body: numbered sections, a **trust-boundary callout**, a **wallet-handoff (popup)** section for gated skills, an **anti-patterns table**, and a **verification** section (how to confirm it worked).
- **Never** instruct handling a seed phrase / private key, and **never** ask the user for one (matches product: private-key inputs removed; matches standing security rules). Signing is always the user's wallet popup.
- No machine-specific paths; absolute facts (portability for upstream + public hosting).

---

## 7. Signing — full picture (no throwaway keys)
- **Default and only model:** the user's **main wallet**, real **popup**, via the §3 browser handoff — `127.0.0.1` loopback callback by default, relay fallback for remote/SSH (§12.1).
- **Any network**, including mainnet/Clarke — a human approves each signature, so there is no test-net restriction.
- **Reads** never need a wallet.
- **Verify** is gasless (SIWE sign-in popup), still the main wallet.
- **No throwaway keys, no env-var private keys, no silent signing.** Fully-unattended signing is explicitly out of scope (it would require holding a key, which we refuse).

---

## 8. Read / registry / handoff surface (CONFIRMED from code)

The §8 read-only investigation is **done**. Findings below are code-grounded; they
settle what a CLI agent can do headlessly vs. what needs the wallet popup, and they
pin down exactly what the callback handoff must add.

### 8.1 What is fully headless — NO browser, NO wallet

| Capability | Mechanism | Auth | Notes |
|---|---|---|---|
| **Discover contracts** | `GET /api/registry?network=<id>` | none | `app/api/registry/route.ts`. Returns `[{address, network, verified, deployer, deployedAt, methods[]}]`. **CORS `*`**, public, `limit 200`, verified-first. A CLI can `curl` it directly. |
| **Get verify status + source** | `GET /api/verify?address=&network=` | none | `app/api/verify/route.ts:15`. Returns `{verified, deployer, source}`. Public, headless. This is how the agent pulls a contract's source. |
| **Session check** | `GET /api/auth/session` | cookie | Returns `{address}` or null. |
| **Read a contract method** | `genlayer-js` `createClient({chain}).readContract(...)` | none | `lib/genlayer/client.ts:51`. **Talks straight to the network RPC** — NOT a Shipyard HTTP route. |
| **Read on-chain code / deploy tx** | `getContractCode` / `getTransaction` via genlayer-js | none | `lib/genlayer/client.ts:87,96`, direct RPC. |

> **Key correction to an earlier assumption:** arbitrary contract *reads* are **not**
> exposed as a Shipyard API route. Only **registry** + **verify GET** are HTTP endpoints.
> Raw method reads happen client-side through `genlayer-js` against the network RPC.
> ⇒ For the skills: **discovery = Shipyard's registry/verify API**; **raw reads =
> genlayer-js / GenLayer CLI against the RPC** (Shipyard is the reference, not the
> transport). Do **not** imply Shipyard has a generic read API — it doesn't.

**RPC endpoints** (`lib/genlayer/networks.ts`): bradbury `https://rpc-bradbury.genlayer.com`,
asimov `https://rpc-asimov.genlayer.com`, studionet `https://studio.genlayer.com/api`,
localnet `http://127.0.0.1:4000/api`. **Only these 4 networks exist in code** — there is
**no Clarke and no mainnet** in `NETWORKS` or the registry's `KNOWN_NETWORKS`. `shipyard-networks`
must reflect that (Clarke = "Soon", not a deploy target).

### 8.2 What needs the wallet popup (the Option A handoff)

| Action | Mechanism | Signature | On-chain/gas |
|---|---|---|---|
| **Deploy** | `deployContract` → `createSignerClientWithProvider` → `client.deployContract` | `eth_sendTransaction` | yes |
| **Write method** | `writeContractMethodWithProvider` → `client.writeContract` | `eth_sendTransaction` | yes |
| **Verify (POST)** | SIWE sign-in → session cookie → `POST /api/verify` | `personal_sign` (SIWE) | no (gasless) |

All three need an EIP-1193 provider from a connected wallet (`connector.getProvider()`,
chain switched first via `switchChainAsync`). This is exactly the §3 browser handoff.

### 8.3 Prefill surface that ALREADY exists

- **Deploy:** `/deploy?source=<LZString.compressToEncodedURIComponent(raw)>` — decompresses,
  validates, parses, prefills source **and constructor defaults parsed from the source**
  (`app/deploy/page.tsx:17-40`). **No `network` param, no constructor-arg *values*, no `callback`.**
- **Interact:** `/interact/<address>?network=<id>&from=<...>` — prefills address (path) + network
  (`app/interact/[address]/page.tsx:34`). Reads run with no wallet; write/verify need in-page connect+sign.
- **Deploy → registry link:** after a successful deploy the client fires `POST /api/registry/record
  {address, network, deployTx}` (`hooks/useDeploy.ts:152`); `record` re-reads the deploy tx for the
  authentic source (`app/api/registry/record/route.ts`). So a CLI-driven deploy that completes in the
  browser auto-lands in the registry — no extra step.

### 8.4 The callback gap — what must be BUILT for Option A

Nothing today POSTs a result back to a `localhost` listener. The fix is **one new,
additive `/handoff` page** (NOT a modification of `/deploy` or `/interact`) plus the
relay endpoint — fully specified in **§12**. In summary it must:

1. Carry a `callback=http://127.0.0.1:<port>` (or `relay=1`) + one-time `state` token,
   and POST/navigate the result back so the CLI's listener can resume (§12.4 #1).
2. Handle `action=deploy` — `network` + `source` + constructor-arg **values** → deploy popup →
   return `{contractAddress, txHash, network}`.
3. Handle `action=write` — `address,network,method,args` → tx popup → return `{txHash}`.
4. Handle `action=verify` — `address,network,source[,deployTx]` → SIWE popup (8.5) +
   `POST /api/verify` → return `{verified, attributed}`.

> **Additive, not a rewrite:** the existing `/deploy`, `/interact`, `/api/verify`, and
> `/api/auth/*` routes are **left untouched**. The `/handoff` page *reuses* their hooks/libs.
> This is what keeps shipping all three actions from regressing the live app.

### 8.5 SIWE headless sequence (reference for the verify popup/callback)
`GET /api/auth/nonce` (sets nonce cookie) → build SIWE message (`createSiweMessage`, `domain` == host,
the issued `nonce`) → **user signs in wallet (`personal_sign`)** → `POST /api/auth/verify {message,
signature}` (checks nonce/domain/expiry, recovers signer, single-use via Redis) → `shipyard_session`
cookie (7-day JWT) → `POST /api/verify`. Confirmed in `hooks/useSiweAuth.ts`, `app/api/auth/*`,
`lib/auth/session.ts`.

### Resolved earlier, reconfirmed
- **Verify is NOT a chain tx** — session + server POST; authenticity trustless, attribution = deployer
  match (`app/api/verify/route.ts:44`).
- **Deploy `?source=` prefill exists** (8.3).

---

## 9. Distribution & `skills.genshipyard.com`
- **Install source = the Git repo.** `plugin marketplace add luch91/shipyard` reads root `.claude-plugin/marketplace.json`. (Or a dedicated skills repo — §4 alternative.)
- **`skills.genshipyard.com` = human catalog**, like `skills.genlayer.com` is for GenLayer. A page (in the Next.js app or a small separate Vercel project) listing the skills + the one-line install command + links to each `SKILL.md`. The subdomain does **not** serve skills to the agent — the repo does; the subdomain is the discovery front door.
- **Vercel wiring:** add the subdomain to the project (or a new project), one route/page rendering the catalog. No new infra cost.
- **Upstream:** after v1 ships, PR a `shipyard` plugin to `genlayerlabs/skills` (same files) for ecosystem discovery — their README invites it.

---

## 10. Build phases (proposed)
1. ~~**Confirm §8** by reading `app/api/*`, `hooks/useContract.ts`, registry code. (read-only)~~ **DONE — see §8.**
2. ~~**Design + build the handoff flow** (callback loopback + full prefill)~~ **DONE (product side):**
   `lib/handoff/protocol.ts` (envelope + base64url + loopback/state validation), `app/handoff/page.tsx`
   (universal deploy/write/verify page — additive, reuses `deployContract` / `writeContractMethodWithProvider`
   / `coerceArgs` / `useAuth` / `/api/verify`), `app/api/handoff/result/route.ts` (relay POST+GET, Redis,
   503 when absent). `tsc --noEmit` clean; `next build` passes (both routes in the manifest). Existing routes
   untouched. **Remaining:** the CLI/skill side (`reference/wallet-handoff.md` listener) + real-agent test.
3. **Scaffold** `marketplace.json` + `plugin.json` + folders. Validate it installs.
4. **Vertical slice:** author `deploy-on-shipyard` + `shipyard-networks` + `reference/wallet-handoff.md` end-to-end; **test with a real agent**: prep headless → browser opens → main-wallet popup → approve → CLI auto-resumes from the callback with the contract address.
5. **Fill out** registry / interact / verify skills + `using-shipyard` router.
6. **Catalog page** at `skills.genshipyard.com`.
7. **Upstream PR** to `genlayerlabs/skills`.

---

## 11. Non-goals (v1)
- Automating the wallet popup / silent signing.
- Throwaway / env-var private keys; fully-unattended signing.
- Duplicating GenLayer's `write-contract` / `genlayer-cli` skills.
- Any flow that asks for or stores a private key / seed phrase.

---

## 12. Callback handoff — detailed design (the one feature to build)

This is the loopback handoff that lets a CLI agent trigger a **real wallet popup** for
deploy / write / verify and **auto-resume** with the outcome — the `vercel login` /
`gh auth login` / `wrangler login` / `stripe login` pattern. It is a **Shipyard product
change**, not skill content. No private key, signature, or seed ever crosses it — only
public outcomes (tx hash, contract address, booleans).

### 12.1 Two transports — loopback (default) + relay (fallback)

| | **Loopback** (default) | **Relay + poll** (fallback) |
|---|---|---|
| When | Agent + browser on the **same machine** | Remote/SSH agent, headless box, or local port blocked |
| Receiver | A short-lived HTTP listener the **CLI** starts on `127.0.0.1:<port>` | Shipyard stores the result; CLI **polls** for it |
| Resume | Browser navigates to the loopback URL → instant | CLI polls `GET /api/handoff/result?state=` until ready |
| New Shipyard routes | none (CLI is the receiver) | `POST` + `GET /api/handoff/result` |

> **Why relay is mandatory, not optional:** when the agent runs over SSH, the browser
> opens on the **user's** machine while `127.0.0.1` resolves to the **remote** box — the
> loopback can never reach the listener. Relay is the only thing that works there. Both
> ship in v1.

### 12.2 One page, one route: `GET /handoff`

A single client page switches on `action`. It **reuses** existing code — `LZString`
decode + `parseContract` + `coerceArgs` (`app/deploy/page.tsx`, `hooks/useDeploy.ts`),
`deployContract`, `useWriteMethod`, `useSiweAuth` + `POST /api/verify`. **No new chain
logic.** It must be served from the **production origin** (`genshipyard.com`) because SIWE
binds the signed `domain` to `window.location.host` and `/api/auth/verify` checks
`fields.domain === host` (`app/api/auth/verify/route.ts:50`).

**Hard UX rule — never auto-fire the wallet action on load.** The page prefills, then the
**human clicks** Deploy / Execute / Verify (one popup, they approve). Only the *return* to
the callback is automatic. This preserves "a human approves every signature" and makes a
page reload idempotent (no silent re-deploy).

#### Common query params (all actions)
| Param | Required | Meaning |
|---|---|---|
| `action` | yes | `deploy` \| `write` \| `verify` |
| `network` | yes | one of the 4 `NetworkId`s (`networks.ts`); rejects anything else |
| `state` | yes | CLI-generated one-time token, ≥128-bit, base64url — echoed back, binds the response to this run |
| `callback` | loopback only | `http://127.0.0.1:<port>/cb` (or `localhost`/`[::1]`) — **loopback-only, validated** (12.4 #2) |
| `relay` | relay only | `1` — page returns via `POST /api/handoff/result` instead of `callback` |

#### Action-specific params + result
| action | extra params | popup | result payload |
|---|---|---|---|
| `deploy` | `source` (LZString), `args` (LZString of JSON object `{paramName: value}`, optional) | `eth_sendTransaction` | `{contractAddress, txHash, network, contractName, pending?}` |
| `write` | `address`, `method`, `args` (JSON `string[]`, optional) | `eth_sendTransaction` | `{txHash, network}` |
| `verify` | `address`, `source` (LZString), `deployTx` (optional) | `personal_sign` (SIWE) then POST | `{verified, attributed}` |

Notes:
- `deploy` `args` are decoded → fed through `coerceArgs` (types from parsed source) exactly
  like the form. If absent, parsed defaults are used (today's behavior).
- `deploy` returns `pending: true` with the `txHash` even if finalization can't be confirmed
  in time — mirrors `lib/genlayer/deploy.ts` (returns the hash even when the receipt wait
  fails), so the CLI never loses the hash on a slow Bradbury finality.
- `verify` runs the §8.5 SIWE sign-in **only if** `GET /api/auth/session` shows no session;
  otherwise it goes straight to `POST /api/verify`.
- After a deploy the existing `POST /api/registry/record` still fires, so the contract lands
  in the registry as today — no extra handoff step.

> **⚠ Network gotcha — Bradbury and Asimov share `chainId: 4221`** (`lib/genlayer/networks.ts`).
> A wallet's `switchChainAsync({ chainId })` **cannot distinguish them** — only the RPC URL
> differs, which the wallet never sees. So `network` in the handoff selects the correct RPC for
> the genlayer-js client (deploy/read target the right chain), but the wallet popup will show the
> same chain id for both testnets. The handoff page must (a) make the **target network explicit
> in the UI** before the user signs, and (b) not rely on chain id alone to confirm the network.
> This is a pre-existing app behavior the handoff inherits — flag it, don't try to "fix" it here.

### 12.3 Result envelope (page → CLI)

One schema for both transports — a base64url-encoded JSON envelope:

```json
{ "v": 1, "state": "<echoed>", "action": "deploy", "ok": true,
  "result": { "contractAddress": "0x…", "txHash": "0x…", "network": "testnet-bradbury" } }
```
On failure:
```json
{ "v": 1, "state": "<echoed>", "action": "deploy", "ok": false,
  "error": { "code": "user_rejected", "message": "…" } }
```
Error `code` ∈ `user_rejected | wrong_network | insufficient_funds | validation | tx_failed | not_authenticated | internal`.

- **Loopback:** page does a top-level navigation `window.location.assign(callback +
  "?payload=" + base64url(envelope))`. A navigation is **not** subject to CORS or to a
  preflight; `http://127.0.0.1` is exempt from mixed-content blocking (loopback is a
  "potentially trustworthy" origin) — which is exactly why every `*-login` CLI uses it.
- **Relay:** page does same-origin `POST /api/handoff/result { state, payload }` — no CORS.

### 12.4 Security model (do not get this wrong)

1. **`state` is mandatory + single-use.** The CLI only accepts a callback whose `state`
   matches its generated token exactly; a mismatch is ignored (keeps waiting) so a stray tab
   can't complete the run. In relay mode `state` is the high-entropy (≥128-bit) lookup key.
2. **`callback` must be loopback — validated on the page before navigating.** Parse the URL;
   require `protocol === "http:"` **and** hostname ∈ {`127.0.0.1`, `[::1]`, `localhost`}.
   Reject everything else. This blocks `?callback=https://evil.com` from turning a signed-in
   user's browser into an open-redirect / exfil vector. **Non-negotiable.**
3. **No secrets through the callback, ever.** Only public outcomes flow. The wallet
   signature and SIWE message stay between wallet → page → Shipyard's **own** server
   (`/api/auth/verify`, `/api/verify`). Never a private key or seed (global constraint).
4. **CLI listener hardening:** bind `127.0.0.1` only (never `0.0.0.0`); ephemeral port;
   serve exactly one matching request then close; hard timeout (≥3 min — must exceed the
   ~30s deploy finalization) → abort with a clear message; reject wrong/missing `state`.
   **Use the literal `127.0.0.1` in both the bind and the `callback` URL — not the word
   `localhost`** — to avoid the IPv4/IPv6 mismatch where the listener binds `127.0.0.1` but the
   browser resolves `localhost` to `[::1]` and the callback never arrives.
5. **Relay endpoint:** store `payload` in Redis at `handoff:result:<state>`, **short TTL
   (~10 min)** and **single-use** (delete on read; first write wins). `state`'s entropy is
   what stops a guessed-key write/read; data is public and ephemeral. Rate-limit polling.
   **Relay requires Redis** (`getRedis()`): when Redis is not configured the relay endpoint
   must return a clear "relay unavailable — use loopback" error (HTTP 503), and the skill
   falls back to loopback. The app already degrades gracefully without Redis elsewhere; relay
   is the one path that genuinely needs it.

### 12.5 Routes to build

| Route | Purpose | Auth |
|---|---|---|
| `GET /handoff` (page) | universal prefill + popup + return; reuses existing hooks/libs | wallet connect in-page; SIWE for verify |
| `POST /api/handoff/result` | relay write: store `payload` by `state` (single-use, TTL) | none (state is the key) |
| `GET /api/handoff/result?state=` | relay poll: return + delete, else `204` | none (state is the key) |

Loopback needs **no** new Shipyard route — the CLI's local server is the receiver.

### 12.6 CLI / skill side (documented in `reference/wallet-handoff.md`)

1. Build the intent (`action` + prefill).
2. `state = base64url(random 32 bytes)`.
3. **Loopback:** start a listener on `127.0.0.1:0`, read the chosen `port`; build
   `…/handoff?…&state=…&callback=http://127.0.0.1:<port>/cb`. **Relay:** build
   `…/handoff?…&state=…&relay=1`.
4. Open the browser to the URL **and** print it (auto-open can fail / be remote).
5. Wait: loopback → first request with matching `state`, respond "Done — return to your
   terminal", close. Relay → poll `GET /api/handoff/result?state=` (back off; respect the
   timeout).
6. Decode `payload`, verify `state`, surface `result` (or `error`) to the agent.

### 12.7 Decisions for you to confirm
- **Origin:** `/handoff` lives in **this app** at production `genshipyard.com` (required by
  SIWE domain-binding). ✅ assumed.
- **Default transport per environment:** loopback when local; the skill auto-falls back to
  relay on SSH/headless/port-bind failure. ✅ assumed.
- **Scope v1 to which actions?** All three (deploy/write/verify) share the one page, so the
  marginal cost of all three is low — recommend shipping all three. (All three reuse already-live
  code paths, so the action count does not add regression risk — see §8.4 "additive".)

### 12.8 Build-time prerequisites to verify (before coding the page)
- **Providers must wrap `/handoff`.** It needs `WagmiProvider` + `RainbowKitProvider` +
  `QueryClientProvider`. Confirm these live in the **root layout** (app-wide) so the new route
  inherits them; if they're per-page, the handoff page must mount them too. (Verify in
  `app/layout.tsx` / the providers component before building.)
- **Marketplace install path.** `plugin marketplace add <owner>/<repo>` uses the **actual GitHub
  repo name** — confirm whether it's `luch91/shipyard`, `luch91/gendeploy`, or other, and make the
  README/catalog match. (`marketplace.json`'s `source: "./plugins/shipyard"` is independent of the
  repo name.)
- **Cross-platform listener.** The user's primary env is Windows; the loopback listener in
  `reference/wallet-handoff.md` must work on Windows shells, not assume a POSIX-only opener
  (`start` vs `open` vs `xdg-open`).
