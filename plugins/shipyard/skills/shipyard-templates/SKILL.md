---
name: shipyard-templates
description: Browse Shipyard's built-in GenLayer Intelligent Contract templates and deploy one. Use when a user wants to start from a template (e.g. hello world, counter, key-value store, escrow, prediction market) instead of their own .py file, or asks to list Shipyard templates.
allowed-tools: WebFetch, Bash, Read
---

# Deploy from a Shipyard template

Start from one of Shipyard's ready-made GenLayer Intelligent Contract templates instead of
writing a contract from scratch. Discovery is autonomous; deploying is the normal wallet popup.

> **Trust boundary.** Listing/fetching templates is read-only (no wallet). Deploying the chosen
> template is an **on-chain transaction (gas)** the user signs in their **own wallet** via the
> handoff. See [reference/trust-boundary.md](../../reference/trust-boundary.md).

## 1. List the templates (autonomous)

```
GET https://genshipyard.com/api/templates
```
Public, CORS `*`. Returns `[{ id, name, description, category, difficulty, tags }]` for all
built-in templates (e.g. `hello-world`, `simple-counter`, `key-value-store`, `wizard-of-coin`,
`prediction-market`, `escrow`, `crowdfunding`, …). Filter client-side by `category`,
`difficulty`, or `tags`.

```bash
curl -s "https://genshipyard.com/api/templates"
```

## 2. Fetch one template's source (autonomous)

```
GET https://genshipyard.com/api/templates?id=<id>
```
Returns the same metadata plus `source` — a ready-to-deploy `.py` with the pinned runner header
already in place (so it passes deploy validation as-is).

```bash
curl -s "https://genshipyard.com/api/templates?id=simple-counter"
```

## 3. Deploy it (wallet popup)

A template is just a contract `source`, so deploy it with the **existing deploy flow** — no
special path:

1. Take the `source` from step 2 (optionally adjust constructor values with the user).
2. Follow [deploy-on-shipyard](../deploy-on-shipyard/SKILL.md) +
   [reference/wallet-handoff.md](../../reference/wallet-handoff.md): compress the source with
   `lz-string`, build the `action=deploy` handoff URL, open it, and let the user approve in
   their wallet.
3. Resume from the result (`contractAddress`, `txHash`).

Pick the network from [shipyard-networks](../shipyard-networks/SKILL.md) (default
`testnet-bradbury`; fund the wallet from the faucet for testnet gas).

## Verify your result

- The deploy result returns the new `contractAddress`; confirm it via
  `GET /api/registry?network=<id>` (see [shipyard-registry](../shipyard-registry/SKILL.md)) or
  the explorer.

## Anti-patterns

| Don't | Do |
|---|---|
| Re-add a runner header to a template | Templates already carry the pinned header |
| Invent a template `id` | List `/api/templates` first; use a real `id` |
| Treat this as a separate deploy mechanism | It feeds the template `source` into the normal deploy handoff |
| Ask for a private key to deploy | The user signs in their own wallet popup |
