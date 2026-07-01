---
name: using-shipyard
description: Entry point for the Shipyard journey — deploy, discover, interact with, and verify GenLayer Intelligent Contracts straight from your CLI. Use when a user wants to use Shipyard / genshipyard, or asks how to deploy or interact with a GenLayer contract via Shipyard. Routes to the right sub-skill.
allowed-tools: Read, WebFetch
---

# Using Shipyard — the journey

Shipyard deploys, discovers, interacts with, and verifies **GenLayer Intelligent Contracts**
straight from your **CLI**. This skill is the router: it explains the flow and points to the right
sub-skill.

## The signing model (one line)

The user signs with their **own wallet via a browser popup**; the **agent never holds a key and
never signs**. The agent prepares everything headlessly, opens a prefilled Shipyard page, the
user approves, and the public result returns to the terminal. No private keys, no seed phrases,
ever. See [reference/trust-boundary.md](../../reference/trust-boundary.md) and
[reference/wallet-handoff.md](../../reference/wallet-handoff.md).

## The journey → which skill

| Step | You want to… | Skill | Wallet? |
|---|---|---|---|
| **Deploy** | Put a `.py` contract on-chain | [deploy-on-shipyard](../deploy-on-shipyard/SKILL.md) | popup (gas) |
| **Discover** | Find contracts, check verified status | [shipyard-registry](../shipyard-registry/SKILL.md) | none |
| **Interact** | Read a method / write a method | [interact-with-contracts](../interact-with-contracts/SKILL.md) | read: none · write: popup (gas) |
| **Verify** | Publish source / claim a contract | [verify-contract-source](../verify-contract-source/SKILL.md) | popup (gasless SIWE) |
| **Reference** | Pick a network, faucet, models | [shipyard-networks](../shipyard-networks/SKILL.md) | none |

## What's autonomous vs. what needs a popup

- **Autonomous (no wallet):** discovery (registry/verify GET) and reading view methods.
- **Wallet popup:** deploy, write, and verify — each prepared headlessly, then approved by the
  user in their own wallet. See [reference/api-surface.md](../../reference/api-surface.md).

## Pairs with GenLayer's own skills

Shipyard's value is the **no-CLI browser flow**. For *authoring* a contract, defer to GenLayer's
`write-contract` skill; for raw method reads / SDK calls, GenLayer's `genlayer-cli`. Shipyard
doesn't duplicate those.

## First things to remember

- Only **four** networks exist (Bradbury, Asimov, Studionet, Localnet); **no Clarke/mainnet**.
- Bradbury and Asimov share `chainId 4221` — confirm the target by name, not chain id.
- Testnet deploy/write needs GEN for gas (faucet). Verify is gasless.
- Only `qwen/qwen3-coder` is verified on OpenRouter for generation.
