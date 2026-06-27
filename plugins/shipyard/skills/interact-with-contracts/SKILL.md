---
name: interact-with-contracts
description: Call methods on a deployed GenLayer Intelligent Contract via Shipyard. Read methods run autonomously; write methods are signed by the user's wallet via a browser popup. Use when a user wants to read or write a contract method.
allowed-tools: WebFetch, Bash, Read
---

# Interact with a deployed contract

Call methods on a deployed GenLayer Intelligent Contract. **Read (view) methods are fully
autonomous; write methods need the user's wallet popup.**

> **Trust boundary.** Reads are open (no key). Writes are **on-chain transactions (gas)** the
> user signs in their **own wallet** via the handoff — you never hold a key. See
> [reference/trust-boundary.md](../../reference/trust-boundary.md).

## 1. Find the contract + its methods (autonomous)

Use [shipyard-registry](../shipyard-registry/SKILL.md) to get the `address`, `network`, and the
`methods[]` list. To see method signatures/types, pull the source with
`GET /api/verify?address=&network=` (if verified) or read it from the deploy tx.

## 2. Read a view method (autonomous — no wallet)

Shipyard has **no generic read API**. A raw method read goes through **genlayer-js** (or the
GenLayer CLI) straight to the network RPC — pair with GenLayer's `genlayer-cli` skill for this.
Pick the RPC for the contract's network from
[reference/api-surface.md](../../reference/api-surface.md), then call the view method. No
signature, no popup.

## 3. Write a method (wallet popup)

A write changes on-chain state and costs gas, so it goes through the handoff
([reference/wallet-handoff.md](../../reference/wallet-handoff.md)) with `action=write`:

```
https://genshipyard.com/handoff?action=write&network=<id>&state=<token>&address=<contract>&method=<name>[&args=<json-array>]&callback=http://127.0.0.1:<port>/cb
```

- `address` — the contract address. `method` — the write method name.
- `args` — a **plain JSON array** string (e.g. `["alice", 42]`), **not** LZString. Omit if none.
- On a testnet make sure the wallet has GEN for gas (see [shipyard-networks](../shipyard-networks/SKILL.md)).
- The page shows the method + args; the user clicks **Execute** and approves. Result: `{ txHash, network }`.

The page never auto-executes — the human clicks Execute and approves. Only the return to your
callback is automatic.

**Always lead with the link (MUST):** output the handoff URL as a clickable link first — every
time, including any relaunch — never just say "the page is open." See *Presenting the handoff* in
[reference/wallet-handoff.md](../../reference/wallet-handoff.md).

## Verify your result

- The returned `txHash` identifies the write. On Bradbury/Asimov, confirm it on the explorer.
- Re-read the relevant view method (step 2) to confirm state changed as intended.

## Anti-patterns

| Don't | Do |
|---|---|
| Trigger a popup / wallet for a read | Reads are autonomous via genlayer-js |
| LZString-encode write `args` | Write `args` is a plain JSON array string |
| Try to auto-click Execute | The human clicks Execute + approves |
| Say "the page is open" without showing the URL | Always print the clickable handoff link first, every time. |
| Ask for a private key to "send" a tx | Never — the user signs in their own wallet |
| Write on a testnet with no GEN | Fund via the faucet first |
