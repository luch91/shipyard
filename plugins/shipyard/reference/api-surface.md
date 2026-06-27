# API surface — headless vs. browser-only

What a CLI agent can do with no wallet and no browser, vs. what needs the wallet popup
([wallet-handoff.md](./wallet-handoff.md)). All findings are grounded in the Shipyard app code.

## Fully headless — NO browser, NO wallet

| Capability | Mechanism | Auth | Notes |
|---|---|---|---|
| **Discover contracts** | `GET https://genshipyard.com/api/registry?network=<id>` | none | Public, CORS `*`. Returns `[{address, network, verified, deployer, deployedAt, methods[]}]`, verified-first, `limit 200`. A CLI can `curl` it directly. |
| **Get verify status + source** | `GET https://genshipyard.com/api/verify?address=&network=<id>` | none | Public. Returns `{verified, deployer, source}`. This is how the agent pulls a contract's source. |
| **Session check** | `GET https://genshipyard.com/api/auth/session` | cookie | Returns `{address}` or null. |
| **Read a contract method** | `genlayer-js` `createClient({chain}).readContract(...)` | none | Talks **straight to the network RPC** — NOT a Shipyard HTTP route. |
| **Read on-chain code / deploy tx** | `getContractCode` / `getTransaction` via `genlayer-js` | none | Direct RPC. |

> **Important correction:** arbitrary contract *reads* are **not** a Shipyard API route.
> Only **registry** and **verify GET** are HTTP endpoints. Raw method reads happen through
> `genlayer-js` (or the GenLayer CLI) against the network RPC.
> ⇒ **Discovery = Shipyard's registry/verify API. Raw reads = genlayer-js against the RPC.**
> Do **not** imply Shipyard has a generic read API — it does not.

## Needs the wallet popup (the handoff)

| Action | Mechanism | Signature | On-chain / gas |
|---|---|---|---|
| **Deploy** | `deployContract` → signer client → `client.deployContract` | `eth_sendTransaction` | yes |
| **Write method** | `writeContractMethodWithProvider` → `client.writeContract` | `eth_sendTransaction` | yes |
| **Verify (POST)** | SIWE sign-in → session cookie → `POST /api/verify` | `personal_sign` (SIWE) | no (gasless) |

All three need an EIP-1193 provider from a connected wallet, with the chain switched first.
That is exactly the browser handoff — see [wallet-handoff.md](./wallet-handoff.md).

## Networks and RPCs

Only these **4 networks exist in code**. There is **no Clarke and no mainnet** as deploy
targets (Clarke = "Soon").

| `NetworkId` | RPC endpoint | Notes |
|---|---|---|
| `testnet-bradbury` | `https://rpc-bradbury.genlayer.com` | Primary testnet. `chainId 4221`. |
| `testnet-asimov` | `https://rpc-asimov.genlayer.com` | `chainId 4221` — **same as Bradbury** (see below). |
| `studionet` | `https://studio.genlayer.com/api` | |
| `localnet` | `http://127.0.0.1:4000/api` | Local only. |

> **⚠ Bradbury and Asimov share `chainId: 4221`.** A wallet's `switchChain({ chainId })`
> cannot tell them apart — only the RPC URL differs, which the wallet never sees. The
> handoff page selects the correct RPC via the `network` param and shows the target network
> name explicitly before the user signs. Never rely on chain id alone to confirm which
> testnet you're on.

## Prefill surface that already exists (for reference)

- **Deploy:** `/deploy?source=<LZString>` — decompresses, validates, parses, and prefills
  source + constructor defaults. No network/arg-values/callback params (the handoff page adds
  those).
- **Interact:** `/interact/<address>?network=<id>` — prefills address + network. Reads run
  with no wallet; write/verify need in-page connect + sign.
- **Deploy → registry:** after a successful deploy the app fires `POST /api/registry/record`,
  so a browser-completed deploy auto-lands in the registry — no extra step.
