---
name: shipyard-registry
description: Browse and search Shipyard's public contract registry. Use to find deployed GenLayer Intelligent Contracts, check whether a contract is verified, or list contracts on a network. Fully autonomous — read-only, no wallet.
allowed-tools: WebFetch, Bash, Read
---

# Shipyard registry — discover deployed contracts

Find and inspect deployed GenLayer Intelligent Contracts through Shipyard's public registry.
**Fully autonomous: no wallet, no popup, no signature.** These are plain public HTTP endpoints.

> **Trust boundary.** Read-only discovery. Nothing here signs or spends. See
> [reference/trust-boundary.md](../../reference/trust-boundary.md).

## 1. List / search contracts on a network

```
GET https://genshipyard.com/api/registry?network=<id>
```
- `<id>` is one of `testnet-bradbury`, `testnet-asimov`, `studionet`, `localnet`
  (see [shipyard-networks](../shipyard-networks/SKILL.md)).
- Public, **CORS `*`**, verified-first, `limit 200`. A CLI can `curl` it directly.
- Each entry: `{ address, network, verified, deployer, deployedAt, methods[] }`.

```bash
curl -s "https://genshipyard.com/api/registry?network=testnet-bradbury"
```

To "search", fetch the list and filter client-side (by `address`, `verified`, a method name in
`methods[]`, etc.). There is no server-side query param beyond `network`.

## 2. Check one contract's verify status + source

```
GET https://genshipyard.com/api/verify?address=<addr>&network=<id>
```
Returns `{ verified, deployer, source }`. This is how you pull a contract's published source and
see who (if anyone) it's attributed to. Public and headless.

```bash
curl -s "https://genshipyard.com/api/verify?address=0x…&network=testnet-bradbury"
```

## 3. What this skill does NOT do

- It does **not** read a contract's *method values* (e.g. `get_balance()`); that's a contract
  call — use [interact-with-contracts](../interact-with-contracts/SKILL.md).
- Shipyard has **no generic read API**. Discovery = registry/verify endpoints; raw reads go
  through genlayer-js / the GenLayer CLI against the RPC. See
  [reference/api-surface.md](../../reference/api-surface.md).

## Verify your result

- A contract you expect should appear in the `network` list with a matching `address`.
- `verified: true` + a non-null `deployer` means the source is published and attributed.
- `verified: false` is normal for a freshly deployed, not-yet-verified contract — not "fake".

## Anti-patterns

| Don't | Do |
|---|---|
| Assume a generic Shipyard read API exists | Registry/verify GET only; raw reads via genlayer-js |
| Treat `verified: false` as fake/broken | It just means source isn't published yet |
| Pass a network other than the four IDs | Reject anything not in `networks` |
| Sign or connect a wallet to browse | Discovery is fully read-only |
