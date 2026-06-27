---
name: shipyard-networks
description: Reference for Shipyard's GenLayer networks (Bradbury, Asimov, Studionet, Localnet; Clarke = soon), when to use each, faucets, wallet/connect requirements, and supported AI models. Use when choosing a network or asking about Shipyard network details.
allowed-tools: Read, WebFetch
---

# Shipyard networks

Reference for the networks Shipyard can target. Autonomous — reading this needs no wallet.
Load it before any deploy/write/verify to pick the right `network` value.

## The networks (the only four that exist in code)

| `network` (NetworkId) | Name | chainId | RPC | Explorer | Use it for |
|---|---|---|---|---|---|
| `testnet-bradbury` | Testnet Bradbury | `4221` | `https://rpc-bradbury.genlayer.com` | `https://explorer-bradbury.genlayer.com` | **Primary deploy target.** Experimental LLM-inference testnet. Default. |
| `testnet-asimov` | Testnet Asimov | `4221` | `https://rpc-asimov.genlayer.com` | `https://explorer-asimov.genlayer.com` | Validator-onboarding testnet. |
| `studionet` | Studionet | `61999` | `https://studio.genlayer.com/api` | — | Browser-based Studio environment. |
| `localnet` | Localnet | `61127` | `http://127.0.0.1:4000/api` | — | Docker-based local dev node (not live by default). |

- **Default network:** `testnet-bradbury`.
- **Clarke / mainnet:** "Soon" — **not** a deploy target. There is no Clarke or mainnet in the
  app. Never offer them as a `network`.

> **⚠ Bradbury and Asimov share `chainId: 4221`.** A wallet's `switchChain({ chainId })`
> cannot tell them apart — only the RPC URL differs, and the wallet never sees it. So when you
> deploy/write, the `network` param selects the correct RPC, but the wallet popup shows the same
> chain id for both testnets. **Always state the target network by name** before the user signs,
> and never rely on chain id alone to confirm which testnet you're on.

## Faucet (testnets only)

Bradbury and Asimov need **GEN** tokens for gas. Faucet:
`https://testnet-faucet.genlayer.foundation` — claim with
`https://testnet-faucet.genlayer.foundation/claim?address=<wallet>&network=bradbury|asimov`.
Tokens usually arrive within ~30 seconds. Studionet/Localnet have no public faucet.

Get tokens **before** a deploy or write on a testnet, or the tx will fail for lack of gas.

## Wallet / connect requirements

- **Reads** (registry, verify status, contract view methods) need **no wallet**.
- **Deploy / write / verify** need a connected wallet and happen via the browser popup — see
  [reference/wallet-handoff.md](../../reference/wallet-handoff.md). Any wallet RainbowKit
  supports works (browser extension or WalletConnect mobile). The agent never holds a key.

## AI models

Shipyard's contract generation runs on OpenRouter. **Only `qwen/qwen3-coder` is verified to
work.** Do **not** suggest or hardcode other/unverified model IDs (free models were removed).

## Verify you picked the right network

- Confirm the `network` you pass is one of the four IDs above (reject anything else).
- For Bradbury vs Asimov, confirm by **name + RPC**, never by chain id (they share `4221`).
- After a deploy, the explorer URL (Bradbury/Asimov) or
  `GET /api/registry?network=<id>` confirms the contract landed on the intended network.

## Anti-patterns

| Don't | Do |
|---|---|
| Offer Clarke or mainnet as a deploy target | Only the four live IDs; Clarke = "Soon" |
| Distinguish Bradbury/Asimov by chain id | Use the `network` param + name + RPC |
| Deploy/write on a testnet with an empty wallet | Claim from the faucet first |
| Suggest an arbitrary OpenRouter model | Only `qwen/qwen3-coder` |
