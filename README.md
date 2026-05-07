# Shipyard

**Browser-based deployment platform for GenLayer Intelligent Contracts.**

Deploy Python Intelligent Contracts to any GenLayer network in under 60 seconds — no CLI, no terminal, no friction.

![GenLayer](https://img.shields.io/badge/GenLayer-Bradbury-34d399?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)

---

## What is Shipyard?

Shipyard is the "Thirdweb for GenLayer" — a fully client-side web app that removes the deployment friction from GenLayer's Intelligent Contract ecosystem. It is built for two personas:

- **Newbies** — no GenLayer experience. Discover it, pick a template, deploy in one click.
- **Experts** — already building on GenLayer. Fast deployment, constructor param introspection, network switching, readable logs.

---

## Features

- **20 contract templates** — from Hello World to living, self-evolving AI contracts
- **One-click deploy** — upload or paste a `.py` contract, fill in params, deploy
- **4 networks** — Testnet Bradbury, Testnet Asimov, Studionet, Localnet
- **Live deploy logs** — streaming terminal output during deployment
- **Interact page** — call read and write methods on any deployed contract
- **One-click fork** — load any deployed contract's source into the editor from the interact page, ready to modify and redeploy
- **Shareable deploy links** — network-aware interact URLs (`/interact/0xabc?network=bradbury`) that pre-select the correct network when shared
- **URL-encoded source sharing** — share a `/deploy?source=<compressed>` link; anyone opening it gets the contract source pre-loaded in the editor, no backend required
- **Export and import deployment history** — export your full history (records + cached contract sources) as a JSON file; import it back on any browser or device
- **Deployment history sidebar** — collapsible history of past deployments with quick links
- **Network comparison** — deploy the same contract to two networks simultaneously
- **Contract diff view** — see what changed when re-deploying an existing contract
- **Faucet widget** — one-click testnet token request when your wallet balance is 0
- **Dark theme** — Fira Code + Syne fonts, emerald accent, no light mode

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Zustand |
| Contract editor | Monaco Editor |
| GenLayer SDK | genlayer-js |
| Animations | Framer Motion |
| Toasts | react-hot-toast |
| Icons | lucide-react |
| Fonts | Fira Code + Syne |
| URL compression | lz-string |
| Analytics | PostHog |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A GenLayer testnet wallet (private key)
- Testnet GEN tokens — get them from the [faucet](https://testnet-faucet.genlayer.foundation)

### Installation

```bash
git clone https://github.com/luch91/shipyard.git
cd shipyard
npm install
```

### Environment (optional)

```bash
cp .env.local.example .env.local
```

The app works without any env vars — users input their private key in the UI. The key is never stored; it lives only in local component state for the duration of the session.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Networks

| Network | Status | Use case |
|---|---|---|
| **Testnet Bradbury** | Live | Primary — LLM inference testnet. Recommended for all deployments. |
| Testnet Asimov | Live | Validator onboarding testnet. Restricted deploy access. |
| Studionet | Live | Browser-based Studio environment. Free gas, instant finalization. |
| Localnet | Local | Docker-based local node. Requires GenLayer stack running on `localhost:4000`. |

> **Bradbury note:** LLM consensus takes 30–120 seconds. Shipyard polls for up to 3 minutes before surfacing the contract address.

---

## Contract Templates

Shipyard ships with 20 ready-to-deploy templates:

| Template | Difficulty | Highlights |
|---|---|---|
| Hello World | Beginner | Basic string state |
| Simple Counter | Beginner | Owner-gated, pure state |
| Key-Value Store | Beginner | `TreeMap` storage |
| Wizard of Coin | Intermediate | Official GenLayer example, LLM decision |
| Content Oracle | Intermediate | Web fetch + LLM Q&A with consensus |
| Prediction Market | Advanced | Web resolution + `eq_principle` |
| Simple DAO | Intermediate | Voting, no LLM |
| Escrow with AI Arbiter | Advanced | 3-party escrow, LLM dispute resolution |
| Web Data Aggregator | Intermediate | Dual-source synthesis |
| Token Price Tracker | Intermediate | Live price from web |
| AI Fact Checker | Advanced | Claim verification vs source URL |
| Crowdfunding | Intermediate | Goal tracking, pure state |
| Sports Bet Resolver | Advanced | Based on official football bets example |
| GitHub Profile Vault | Intermediate | Dual equivalence principle |
| Evolving Story | Advanced | **Living** — grows chapter by chapter via LLM |
| Digital Pet | Intermediate | **Living** — hunger/happiness/energy evolves |
| Self-Updating Knowledge Base | Advanced | **Living** — merges web knowledge into itself |
| Adaptive Persona | Advanced | **Living** — personality evolves through conversation |
| On-Chain Debate Arena | Advanced | Two-sided LLM debate with judgment |
| Living Constitution | Advanced | **Living** — self-amending governance document |

---

## Project Structure

```
shipyard/
├── app/
│   ├── page.tsx              # Landing page
│   ├── deploy/page.tsx       # Deploy flow
│   ├── templates/page.tsx    # Template gallery
│   ├── interact/[address]/   # Contract interaction
│   └── compare/page.tsx      # Network comparison
├── components/
│   ├── deploy/               # ContractUploader, NetworkSelector, DeployForm, DeployLogs, FaucetWidget, ContractDiff
│   ├── interact/             # ContractPanel, ReadMethods, WriteMethods
│   ├── layout/               # Header, Sidebar
│   ├── providers/            # Client-side provider wrappers (PostHog, Toaster)
│   └── ui/                   # Button, Card, Spinner, CopyButton, NetworkBadge
├── hooks/
│   ├── useDeployStore.ts     # Zustand global state
│   ├── useDeploy.ts          # Deploy orchestration
│   ├── useWallet.ts          # Wallet connect/disconnect/balance
│   └── useContract.ts        # Read/write method hooks
├── lib/
│   ├── genlayer/
│   │   ├── networks.ts       # Network configs and colors
│   │   ├── client.ts         # genlayer-js client factory
│   │   ├── parser.ts         # Python contract parser
│   │   ├── deploy.ts         # Deploy orchestration
│   │   └── templates.ts      # 20 contract templates
│   ├── analytics.ts          # PostHog event wrapper
│   └── diff.ts               # Line-level diff utility
└── types/index.ts            # Shared TypeScript types
```

---

## GenLayer Contract Requirements

All contracts must follow GenLayer's Intelligent Contract format:

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class MyContract(gl.Contract):
    state_var: str

    def __init__(self, initial_value: str):
        self.state_var = initial_value

    @gl.public.view
    def get_value(self) -> str:
        return self.state_var

    @gl.public.write
    def set_value(self, new_value: str):
        self.state_var = new_value
```

> **Important:** The `py-genlayer:test` dependency alias does not resolve on Bradbury. Always use the pinned hash shown above. Shipyard validates this automatically.

---

## Security

- Private keys are **never stored** — not in Zustand, not in localStorage, not anywhere. They live only in local `useState` for the duration of the signing operation and are cleared on component unmount.
- Only the wallet **address** is persisted to localStorage for UX continuity.
- This is a fully client-side app — no backend, no server actions, no API routes that touch private keys.

---

## Resources

- [GenLayer Docs](https://docs.genlayer.com)
- [genlayer-js SDK](https://docs.genlayer.com/genlayer-stack/genlayer-js)
- [GenLayer Studio](https://studio.genlayer.com)
- [Testnet Faucet](https://testnet-faucet.genlayer.foundation)
- [genlayer-js GitHub](https://github.com/genlayerlabs/genlayer-js)

---

## License

MIT

---

*Built by [Luchi](https://github.com/luch91) · Powered by [GenLayer](https://genlayer.com)*
