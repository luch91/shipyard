---
name: verify-contract-source
description: Verify and publish a GenLayer Intelligent Contract's source on Shipyard, and optionally attribute it to the user's wallet. Use when a user wants to verify source authenticity or claim a contract. Gasless SIWE sign-in via a browser popup.
allowed-tools: Read, WebFetch, Bash
---

# Verify a contract's source on Shipyard

Publish a contract's source so the registry shows it as **verified**, and optionally **attribute**
it to the user's wallet. This is **gasless** — the only signature is an off-chain SIWE sign-in.

> **Trust boundary.** Verify is **not** a chain transaction. Authenticity is proven by the
> server comparing your source to the on-chain/deploy-tx code. The only auth is a **gasless SIWE
> sign-in** (a `personal_sign` message, no gas). Attribution requires the **deployer's** wallet.
> See [reference/trust-boundary.md](../../reference/trust-boundary.md).

## 1. Check current status (autonomous)

```
GET https://genshipyard.com/api/verify?address=<addr>&network=<id>
```
Returns `{ verified, deployer, source }`. If already `verified: true` with the right `deployer`,
there's nothing to do.

## 2. Verify (wallet popup, gasless)

Go through the handoff ([reference/wallet-handoff.md](../../reference/wallet-handoff.md)) with
`action=verify`:

```
https://genshipyard.com/handoff?action=verify&network=<id>&state=<token>&address=<contract>&source=<lz>[&deployTx=<hash>]&callback=http://127.0.0.1:<port>/cb
```

- `source` — the raw `.py`, LZString-encoded (`compressToEncodedURIComponent`; see the handoff
  reference). Must match what's deployed, or authenticity fails.
- `deployTx` *(optional)* — the deploy transaction hash. Provide it to let the **deployer's
  wallet** claim attribution.
- The page runs the SIWE sign-in **only if** there's no active session, then `POST /api/verify`.
  The user approves a **sign-in message** (no gas). Result: `{ verified, attributed }`.

**Always lead with the link (MUST):** output this URL as a clickable link first — every time,
including any relaunch — never just say "the page is open." See *Presenting the handoff* in
[reference/wallet-handoff.md](../../reference/wallet-handoff.md).

## 3. Interpreting the result

- `verified: true` — the source is authentic and now published.
- `attributed: true` — the signed-in wallet equals the deployer, so the contract is credited to
  it. `attributed: false` with `verified: true` is a **valid, graceful outcome**: anyone can
  verify authenticity; only the deployer earns attribution.

## Verify your result

- Re-run step 1: `GET /api/verify` should now show `verified: true` (and `deployer` set when
  attributed).
- The contract's registry entry flips to verified (see [shipyard-registry](../shipyard-registry/SKILL.md)).

## Anti-patterns

| Don't | Do |
|---|---|
| Treat verify as an on-chain/gas tx | It's a gasless SIWE sign-in + server POST |
| Submit source that differs from deployed | Authenticity compares against on-chain/deploy-tx code |
| Expect attribution from a non-deployer wallet | Authenticity yes; attribution needs the deployer |
| Ask for a private key/seed to "sign in" | Never — SIWE is a wallet popup the user approves |
| Say "the page is open" without showing the URL | Always print the clickable handoff link first, every time. |
