# Shipyard

**Browser-based deployment platform for GenLayer Intelligent Contracts.**

Deploy Python Intelligent Contracts to any GenLayer network in under 60 seconds — no CLI, no terminal, no friction.

![GenLayer](https://img.shields.io/badge/GenLayer-Bradbury-34d399?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)

---

## What is Shipyard?

Shipyard is the "Thirdweb for GenLayer" — a web app that removes the deployment friction from GenLayer's Intelligent Contract ecosystem. It is built for two personas:

- **Newbies** — no GenLayer experience. Discover it, pick a template, deploy in one click.
- **Experts** — already building on GenLayer. Fast deployment, constructor param introspection, network switching, readable logs.

---

## Features

- **20 contract templates** — from Hello World to living, self-evolving AI contracts
- **AI contract generation** — describe your contract in plain English, get a deployable Python Intelligent Contract in seconds
- **One-click deploy** — upload, paste, or generate a `.py` contract, fill in params, deploy
- **Pre-filled constructor params** — templates and AI-generated contracts arrive with example values ready to deploy
- **4 networks** — Testnet Bradbury, Testnet Asimov, Studionet, Localnet
- **Network health indicators** — real-time RPC status per network (online / slow / offline)
- **Live deploy logs** — streaming terminal output during deployment
- **Public contract registry** — a DB-backed registry of contracts deployed through Shipyard (and external contracts that claim attribution), with verification badges and method previews
- **Recent activity feed** — a live feed of recent deploys, verifications and forks beneath the registry; only contracts already listed in the registry ever appear, and a builder is named only where the registry has proven ownership
- **Contract verification** — prove a contract's source by signing in with your wallet (SIWE); Shipyard matches your published source against the on-chain code and attributes the deploy to your address
- **Wallet sign-in (SIWE)** — passwordless authentication via "Sign-In with Ethereum"; a session is held in an httpOnly cookie, no passwords or keys involved
- **Interact page** — call read and write methods on any deployed contract
- **One-click fork** — load any deployed contract's source into the editor from the interact page, ready to modify and redeploy
- **Shareable deploy links** — network-aware interact URLs (`/interact/0xabc?network=bradbury`) that pre-select the correct network when shared
- **URL-encoded source sharing** — share a `/deploy?source=<compressed>` link; anyone opening it gets the contract source pre-loaded in the editor, no backend required
- **Export and import deployment history** — export your full history (records + cached contract sources) as a JSON file; import it back on any browser or device
- **Deployment history sidebar** — collapsible history of past deployments with quick links
- **Network comparison** — deploy the same contract to two networks simultaneously
- **Contract diff view** — see what changed when re-deploying an existing contract
- **Faucet widget** — one-click testnet token request when your wallet balance is 0
- **Responsive navigation** — collapsible desktop sidebar plus a mobile bottom-nav and a top back-bar for deep pages
- **First-party analytics** — privacy-preserving event tracking; wallet addresses are SHA-256 hashed before storage (raw wallets are never stored), with daily rollups via Vercel Cron
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
| Wallet | wagmi v2 + RainbowKit |
| Database | Supabase (PostgreSQL, RLS) |
| Auth | SIWE (viem + jose, httpOnly JWT cookie) |
| Cache / nonce store | Upstash Redis |
| Scheduled jobs | Vercel Cron |
| Animations | Framer Motion |
| Toasts | react-hot-toast |
| Icons | lucide-react |
| Fonts | Fira Code + Syne |
| URL compression | lz-string |
| Analytics | First-party (Supabase) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A browser wallet (MetaMask, Rabby, etc.) connected to a GenLayer network
- Testnet GEN tokens — get them from the [faucet](https://testnet-faucet.genlayer.foundation)

### Installation

```bash
git clone https://github.com/luch91/shipyard.git
cd shipyard
npm install
```

### Environment

```bash
cp .env.local.example .env.local
```

The app works without any env vars for basic deployment — every backend feature degrades gracefully when its keys are absent. Configure only what you need:

| Variable(s) | Enables | Required? |
|---|---|---|
| `OPENROUTER_API_KEY` | AI contract generation ([get a key](https://openrouter.ai/keys)) | Optional |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect/RainbowKit wallet connection ([get one](https://cloud.walletconnect.com)) | Optional |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Registry, contract verification, analytics storage | Optional |
| `SESSION_SECRET` | SIWE wallet sign-in (signs the session JWT) | With Supabase |
| `ANALYTICS_SALT` | Hashing salt for first-party analytics | With Supabase |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Caching, rate-limiting, SIWE nonce store | Optional |
| `CRON_SECRET` | Protects the Vercel Cron rollup route | With Cron |
| `SUPABASE_DB_URL` | Running migrations only (`supabase db push`) | Migrations |

See `.env.local.example` for full notes on each. All server secrets are server-side only (no `NEXT_PUBLIC_` prefix) — the `service_role` key bypasses RLS and must never reach the client.

Shipyard never has access to your private keys — all transactions are signed in your connected wallet, and Shipyard only receives the resulting signature.

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
| Testnet Asimov | Live | Validator onboarding testnet. Open for general deployment. |
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
├── middleware.ts             # Canonical-host redirect (production only)
├── app/
│   ├── page.tsx              # Landing page
│   ├── deploy/page.tsx       # Deploy flow
│   ├── templates/page.tsx    # Template gallery
│   ├── interact/[address]/   # Contract interaction
│   ├── compare/page.tsx      # Network comparison
│   ├── registry/page.tsx     # Public contract registry
│   ├── history/page.tsx      # Deployment history
│   ├── terms/, privacy/      # Legal pages
│   └── api/
│       ├── generate/         # AI contract generation (OpenRouter proxy)
│       ├── registry/         # DB-backed registry (+ record/ to log deploys)
│       ├── activity/         # Public recent-activity feed (registry-gated)
│       ├── verify/           # Contract source verification (SIWE + on-chain match)
│       ├── auth/             # SIWE nonce / verify / session / logout
│       ├── analytics/        # First-party event ingestion
│       └── cron/             # Vercel Cron analytics rollup
├── components/
│   ├── deploy/               # ContractUploader, NetworkSelector, DeployForm, DeployLogs, FaucetWidget, ContractDiff
│   ├── interact/             # ContractPanel, ReadMethods, WriteMethods
│   ├── registry/             # RegistryClient
│   ├── activity/             # ActivityFeed (recent deploys/verifications/forks)
│   ├── auth/                 # SignInButton (SIWE)
│   ├── layout/               # Header, Sidebar, BottomNav, MobileTopBar, Logo
│   ├── providers/            # Client-side provider wrappers (Web3, analytics)
│   └── ui/                   # Button, Card, Spinner, CopyButton, NetworkBadge
├── hooks/
│   ├── useDeployStore.ts     # Zustand global state
│   ├── useDeploy.ts          # Deploy orchestration
│   ├── useWallet.ts          # Wallet connect/disconnect/balance
│   ├── useNetworkHealth.ts   # Real-time RPC health per network
│   ├── useContract.ts        # Read/write method hooks
│   ├── useSiweAuth.ts        # SIWE sign-in flow + session state
│   └── useNavNew.ts          # "New" nav badge dismissal (localStorage)
├── lib/
│   ├── genlayer/
│   │   ├── networks.ts       # Network configs and colors
│   │   ├── client.ts         # genlayer-js client factory + on-chain helpers
│   │   ├── parser.ts         # Python contract parser and validator
│   │   ├── deploy.ts         # Deploy orchestration
│   │   ├── templates.ts      # 20 contract templates
│   │   └── runners.ts        # Pinned GenLayer runner hashes
│   ├── ai/
│   │   ├── models.ts         # OpenRouter model definitions
│   │   └── systemPrompt.ts   # GenLayer contract generation prompt
│   ├── activity/
│   │   ├── feed.ts           # Activity feed aggregation (registry gate + dedupe)
│   │   └── timeAgo.ts        # Compact relative timestamps
│   ├── supabase/server.ts    # Service-role Supabase client (server-side)
│   ├── auth/session.ts       # SIWE session JWT (sign/verify)
│   ├── redis.ts              # Upstash Redis client (graceful if unconfigured)
│   ├── analytics.ts          # First-party analytics event wrapper
│   └── diff.ts               # Line-level diff utility
├── supabase/migrations/      # SQL schema (RLS deny-by-default)
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

Both declaration styles are supported:

```python
# Inheritance (classic)
class MyContract(gl.Contract):
    ...

# Decorator (alternative)
@gl.contract
class MyContract:
    ...
```

> **Important:** Floating runner tags (`py-genlayer:test`, `py-genlayer:latest`) are rejected at deploy on **all networks** — Bradbury, Asimov, and Studionet. Always use the pinned hash shown above. Shipyard validates this automatically and treats floating tags as a hard error.

---

## Security

- Shipyard **never has access to your private keys**. Transactions are signed inside your connected wallet (MetaMask, Rabby, etc.) via WalletConnect/RainbowKit — Shipyard only receives the resulting signature, never the key.
- Only the wallet **address** is persisted to localStorage for UX continuity. First-party analytics hash wallet addresses with a server-side salt (`ANALYTICS_SALT`) before storage — raw wallets are never stored.
- The **public activity feed** (`/api/activity`) is derived from analytics events but cannot deanonymise anyone. Analytics rows hold only a salted wallet hash, so the feed never reads a wallet from them — attribution comes solely from the registry's `deployer_wallet`, which is set after SIWE ownership verification and is already public on `/builders`. An event is shown only when its contract is already listed in the registry, so the feed cannot surface anything that was not already discoverable.
- **Authentication** uses SIWE ("Sign-In with Ethereum"): a wallet signature establishes a session held in a signed, httpOnly JWT cookie (`SESSION_SECRET`). Sign-in nonces are single-use and stored in Redis to prevent replay.
- **Database access** is server-side only via the Supabase `service_role` key; Row-Level Security is enabled deny-by-default on every table, and the service key is never exposed to the client.
- All server-side API routes (`/api/generate`, `/api/registry`, `/api/activity`, `/api/verify`, `/api/auth/*`, `/api/analytics`, `/api/cron/*`) run with secrets that live only on the server. The Vercel Cron route is protected by a bearer secret (`CRON_SECRET`); the OpenRouter key (`OPENROUTER_API_KEY`) never reaches the client.
- The canonical-host redirect in `middleware.ts` runs in production only, so local/LAN previews are never bounced to the live domain.

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
