---
name: deploy-on-shipyard
description: Deploy a GenLayer Intelligent Contract through Shipyard's browser flow (no CLI). Use when a user wants to deploy a .py contract to Bradbury, Asimov, Studionet, or Localnet. The user signs the deploy transaction in their own wallet via a browser popup.
allowed-tools: Read, Grep, Glob, WebFetch, Bash
---

# Deploy a GenLayer Intelligent Contract on Shipyard

Deploy a Python Intelligent Contract through Shipyard's browser flow — no GenLayer CLI, no
private key. You prepare everything headlessly, hand off to a **wallet popup** for the deploy
transaction, then resume with the contract address.

> **Trust boundary.** Deploy is an **on-chain transaction (gas)**. The user signs it in their
> **own wallet** via the popup; you never hold a key and never sign. See
> [reference/trust-boundary.md](../../reference/trust-boundary.md).

## 0. Author the contract first (out of scope here)

This skill *deploys* a contract; it does not author one. For writing the `.py` contract, pair
with GenLayer's `write-contract` skill. You only need the finished source file here.

## 1. Pre-deploy checklist (validate headlessly)

The handoff page re-validates, but check these yourself first so the deploy doesn't bounce.
A contract must:

- include `from genlayer import *`;
- define a contract class — either `class MyContract(gl.Contract):` or `@gl.contract` above
  the class;
- define a `def __init__(self, ...)` constructor;
- carry the **pinned runner header** as its first line, e.g.
  `# { "Depends": "py-genlayer:<RUNNER_HASH>" }`.
  - **Floating tags `py-genlayer:test | latest | dev` are rejected at deploy on every
    network** — never use them.
  - The canonical hash lives in the GenLayer SDK runner list
    (`https://sdk.genlayer.com/main/impl-spec/appendix/available-runners.html`) and in the
    Shipyard app's `lib/genlayer/runners.ts`. As of June 2026 the standard single-file runner
    is `1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6` — **verify it's current** rather
    than trusting this copy.

Then read the constructor signature to learn the **constructor params** (name + type) you may
need to fill.

## 2. Choose the network

Pick one `network` from [shipyard-networks](../shipyard-networks/SKILL.md): default
`testnet-bradbury`. On a testnet, make sure the wallet has **GEN** for gas (faucet — see that
skill) or the deploy will fail. Remember Bradbury and Asimov share `chainId 4221`: state the
target by name before the user signs.

## 3. Build the deploy intent

- `source` — the raw `.py`, compressed with `lz-string`'s `compressToEncodedURIComponent`.
- `args` *(optional)* — a JSON object `{paramName: value}` of constructor values, compressed the
  same way. If omitted, the page uses the defaults parsed from the source.

See [reference/wallet-handoff.md](../../reference/wallet-handoff.md) for the compression and
`state`-generation one-liners.

## 4. Hand off to the wallet popup

Follow [reference/wallet-handoff.md](../../reference/wallet-handoff.md). The deploy URL is:

```
https://genshipyard.com/handoff?action=deploy&network=<id>&state=<token>&source=<lz>[&args=<lz>]&callback=http://127.0.0.1:<port>/cb
```

(or `&relay=1` instead of `callback` when remote/headless). Start your loopback listener (or
relay poll) **before** opening the browser, then open it **and** print the URL.

**The page never auto-deploys.** The user clicks **Deploy**, then approves the transaction in
their wallet. Only the return to your callback is automatic — do not try to bypass the click.

## 5. Resume from the result

Decode the returned envelope and verify the echoed `state`. On success the `result` is:

```json
{ "contractAddress": "0x…", "txHash": "0x…", "network": "testnet-bradbury",
  "contractName": "MyContract", "pending": false }
```

- `pending: true` is **not a failure** — it means the tx hash is confirmed but finalization
  couldn't be confirmed in time (slow finality). Keep the `txHash` and poll for finality.
- On failure you get `ok: false` with an `error.code` (e.g. `user_rejected`,
  `insufficient_funds`, `wrong_network`, `tx_failed`). Report it plainly; for
  `insufficient_funds` on a testnet, point the user to the faucet.

After a successful deploy the app automatically records the contract to the registry — no extra
step from you.

## 6. Verify it worked

- `GET https://genshipyard.com/api/registry?network=<id>` should list the new `contractAddress`.
- On Bradbury/Asimov, the explorer (`https://explorer-<bradbury|asimov>.genlayer.com`) shows the
  deploy tx.
- Optionally read a view method (see [interact-with-contracts](../interact-with-contracts/SKILL.md))
  to confirm the contract responds.

## Anti-patterns

| Don't | Do |
|---|---|
| Ask for / accept a private key or seed phrase | Never. The user signs in their own wallet popup. |
| Try to auto-fire or script-click the Deploy button | The human clicks Deploy + approves; only the return is automatic. |
| Use a floating runner tag (`py-genlayer:test/latest/dev`) | Use the pinned `RUNNER_HASH` header. |
| Pick Bradbury vs Asimov by chain id | They share `4221` — use the `network` param + name. |
| Deploy on a testnet with an empty wallet | Claim GEN from the faucet first. |
| Treat `pending: true` as a failed deploy | It carries the `txHash`; poll for finality. |
| Construct an `https://` or external `callback` | `callback` is loopback-only; the page rejects the rest. |
