# Shipyard

Shipyard is a browser application for GenLayer Intelligent Contracts.

Use Shipyard to create, deploy, verify, and manage Python contracts. You do not
need a command-line interface for the standard deployment workflow.

![GenLayer](https://img.shields.io/badge/GenLayer-Bradbury-34d399?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)

## Purpose

Shipyard reduces the work that is necessary to deploy a GenLayer Intelligent
Contract.

Beginners can select a template and deploy it. Experienced developers can
upload source code, set constructor parameters, change networks, and examine
deployment logs.

## Main functions

- Select from 20 contract templates.
- Generate contract source code from a text description.
- Upload, paste, or generate a Python contract.
- Set constructor parameters before deployment.
- Use example parameter values in templates and generated contracts.
- Deploy to Bradbury, Asimov, Studionet, or Localnet.
- View Clarke as a planned network. Clarke is not selectable.
- View the current RPC status of each network.
- View deployment logs while a deployment is in progress.
- Find public contracts in the contract registry.
- View recent public deployments, verifications, and forks.
- Verify contract source code with Sign-In with Ethereum (SIWE).
- Sign in to public features with a wallet.
- Sign in to the admin console with a password.
- Use an optional wallet allowlist as an admin fallback.
- Call read and write methods on a deployed contract.
- Copy a deployed contract into the editor and change it.
- Share a network-specific contract interaction link.
- Share compressed contract source code in a deployment link.
- Export deployment history to a JSON file.
- Import deployment history from a JSON file.
- Compare one contract on two networks.
- View source differences between contract versions.
- Request testnet tokens when the connected wallet has no balance.
- Use the application on desktop and mobile devices.
- Store privacy-preserving analytics with hashed wallet addresses.

## Technology

| Function | Technology |
|---|---|
| Application framework | Next.js 14 with App Router |
| Programming language | TypeScript with strict checks |
| Styles | Tailwind CSS |
| Client state | Zustand |
| Contract editor | Monaco Editor |
| GenLayer access | genlayer-js |
| Wallet connection | wagmi v2 and RainbowKit |
| Database | Supabase with PostgreSQL and Row-Level Security |
| Public authentication | SIWE, viem, jose, and an HTTP-only JWT cookie |
| Admin authentication | Password session with an optional wallet allowlist |
| Cache and nonce storage | Upstash Redis |
| Scheduled tasks | Vercel Cron |
| Animation | Framer Motion |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Fonts | Inter, Syne, and Fira Code |
| URL compression | lz-string |
| Analytics | First-party analytics with Supabase |

## Install Shipyard

### Prerequisites

Install or obtain these items:

- Node.js 20 or a later version
- A compatible browser wallet, such as MetaMask or Rabby
- Testnet GEN tokens from the [GenLayer faucet](https://testnet-faucet.genlayer.foundation)

### Install the dependencies

Run these commands:

```bash
git clone https://github.com/luch91/shipyard.git
cd shipyard
npm install
```

### Create the environment file

Run this command:

```bash
cp .env.local.example .env.local
```

Basic contract deployment does not require backend environment variables.
Configure only the functions that you use.

| Variable | Function | Requirement |
|---|---|---|
| `OPENROUTER_API_KEY` | Generates contracts with AI | Optional |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Connects wallets through WalletConnect and RainbowKit | Optional |
| `SUPABASE_URL` | Connects to Supabase | Required for Supabase functions |
| `SUPABASE_ANON_KEY` | Provides public Supabase access | Required for Supabase functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Provides server-side Supabase access | Required for Supabase functions |
| `SESSION_SECRET` | Signs SIWE session tokens | Required with Supabase authentication |
| `ANALYTICS_SALT` | Hashes wallet addresses for analytics | Required with Supabase analytics |
| `UPSTASH_REDIS_REST_URL` | Connects to Upstash Redis | Optional |
| `UPSTASH_REDIS_REST_TOKEN` | Authenticates with Upstash Redis | Optional |
| `CRON_SECRET` | Protects the Vercel Cron route | Required with Vercel Cron |
| `ADMIN_PASSWORD` | Enables password access to `/admin` | Required for password admin access |
| `ADMIN_WALLETS` | Defines wallet addresses for admin fallback access | Optional |
| `SUPABASE_DB_URL` | Runs Supabase database migrations | Required for migrations |
| `GOOGLE_SITE_VERIFICATION` | Adds a Google verification token to public metadata | Optional |

Read `.env.local.example` for more information about each variable.

Do not add a `NEXT_PUBLIC_` prefix to a server secret. The Supabase
`service_role` key bypasses Row-Level Security. Never send this key to the
browser.

Shipyard does not receive private keys or seed phrases. The connected wallet
signs each transaction. Shipyard receives only the result of the signing
operation.

### Start the development server

Run this command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Networks

| Network | Status | Purpose |
|---|---|---|
| Testnet Bradbury | Live | Primary testnet for LLM inference |
| Testnet Asimov | Live | Testnet for validator onboarding and general deployment |
| Studionet | Live | Studio network with free gas and fast finalization |
| Localnet | Local | Local GenLayer node at `localhost:4000` |
| Testnet Clarke | Planned | Visible in the product, but not selectable |

Bradbury consensus usually takes 30 to 120 seconds. Shipyard checks the
deployment for up to three minutes before it reports the contract address.

## Contract templates

Shipyard includes these 20 templates:

| Template | Level | Main function |
|---|---|---|
| Hello World | Beginner | Stores a string |
| Simple Counter | Beginner | Changes owner-controlled state |
| Key-Value Store | Beginner | Stores values in a `TreeMap` |
| Wizard of Coin | Intermediate | Uses an LLM decision |
| Content Oracle | Intermediate | Gets web data and uses LLM consensus |
| Prediction Market | Advanced | Resolves a result with `eq_principle` |
| Simple DAO | Intermediate | Records votes without an LLM |
| Escrow with AI Arbiter | Advanced | Resolves escrow disputes with an LLM |
| Web Data Aggregator | Intermediate | Combines two web sources |
| Token Price Tracker | Intermediate | Gets a token price from the web |
| AI Fact Checker | Advanced | Checks a claim against a source URL |
| Crowdfunding | Intermediate | Tracks contributions and a target |
| Sports Bet Resolver | Advanced | Resolves a sports result |
| GitHub Profile Vault | Intermediate | Uses two equivalence checks |
| Evolving Story | Advanced | Adds chapters with an LLM |
| Digital Pet | Intermediate | Changes hunger, happiness, and energy |
| Self-Updating Knowledge Base | Advanced | Adds web information to stored knowledge |
| Adaptive Persona | Advanced | Changes a persona through conversation |
| On-Chain Debate Arena | Advanced | Evaluates an LLM debate |
| Living Constitution | Advanced | Changes a governance document |

## Project structure

```text
shipyard/
|-- .github/                  # Continuous integration and repository templates
|-- app/                      # Pages, layouts, metadata, and API routes
|-- components/               # User interface components and providers
|-- docs/                     # Technical documents and archived plans
|-- hooks/                    # Client state and GenLayer hooks
|-- lib/                      # Authentication, data, and domain functions
|-- plugins/                  # Shipyard Codex plugin
|-- public/                   # Static files and discovery resources
|-- scripts/                  # Deployment and validation scripts
|-- skills/                   # Shipyard agent skills
|-- supabase/migrations/      # Database changes
|-- tests/                    # Automated tests
|-- types/                    # Shared TypeScript types
|-- CHANGELOG.md              # Release history
|-- CONTRIBUTING.md           # Contribution instructions
`-- middleware.ts             # Host and subdomain routing
```

## Contract requirements

A contract must use the GenLayer Intelligent Contract format.

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

Shipyard supports inheritance syntax and decorator syntax.

```python
# Inheritance syntax
class MyContract(gl.Contract):
    ...

# Decorator syntax
@gl.contract
class MyContract:
    ...
```

Do not use a floating runner tag such as `py-genlayer:test` or
`py-genlayer:latest`. Shipyard rejects floating runner tags on all selectable
networks. Use the pinned runner hash in the example.

## Security

- Shipyard does not receive private keys or seed phrases.
- The connected wallet signs each transaction.
- The browser stores only the wallet address for interface continuity.
- Analytics uses `ANALYTICS_SALT` to hash wallet addresses before storage.
- Analytics does not store unmodified wallet addresses.
- The activity feed shows only contracts that are already in the registry.
- Registry attribution requires SIWE ownership verification.
- Public authentication uses a signed, HTTP-only JWT cookie.
- Redis stores single-use SIWE nonces to prevent replay.
- Admin authentication uses a separate password endpoint and cookie.
- The admin password endpoint has rate limits.
- `ADMIN_PASSWORD` remains on the server.
- `ADMIN_WALLETS` can provide optional fallback access.
- Supabase Row-Level Security denies access by default.
- The Supabase `service_role` key remains on the server.
- Server API routes do not send server secrets to the client.
- `CRON_SECRET` protects the scheduled analytics route.
- Production middleware redirects requests to the canonical host.
- Local previews do not redirect to the production host.

Report a security problem through the process in [SECURITY.md](SECURITY.md).

## Validate a change

Run these commands before you submit a change:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the complete contribution process.

## Resources

- [GenLayer documentation](https://docs.genlayer.com)
- [genlayer-js documentation](https://docs.genlayer.com/genlayer-stack/genlayer-js)
- [GenLayer Studio](https://studio.genlayer.com)
- [GenLayer faucet](https://testnet-faucet.genlayer.foundation)
- [genlayer-js source](https://github.com/genlayerlabs/genlayer-js)
- [Enterprise metadata audit](docs/ENTERPRISE_METADATA_AUDIT.md)

## License

Shipyard uses the [MIT License](LICENSE).

Built by [Luchi](https://github.com/luch91). Powered by
[GenLayer](https://genlayer.com).
