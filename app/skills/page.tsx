import type { Metadata } from 'next'
import { Rocket, Search, Zap, ShieldCheck, Network, Compass, Github } from 'lucide-react'
import Card from '@/components/ui/Card'
import CopyButton from '@/components/ui/CopyButton'

export const metadata: Metadata = {
  title: 'Skills',
  description:
    'Shipyard Skills. A Claude Code plugin that teaches agents the full Shipyard journey: deploy, discover, interact with, and verify GenLayer Intelligent Contracts straight from your CLI.',
}

const REPO_URL = 'https://github.com/luch91/shipyard'

const ADD_CMD = '/plugin marketplace add luch91/shipyard'
const INSTALL_CMD = '/plugin install shipyard@shipyard'

type Role = 'Autonomous' | 'Wallet popup' | 'Gasless popup' | 'Read · write popup' | 'Reference' | 'Router'

const ROLE_CLASS: Record<Role, string> = {
  Autonomous: 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300',
  'Wallet popup': 'border-amber-500/30 bg-amber-500/[0.08] text-amber-300',
  'Gasless popup': 'border-violet-500/30 bg-violet-500/[0.08] text-violet-300',
  'Read · write popup': 'border-amber-500/30 bg-amber-500/[0.08] text-amber-300',
  Reference: 'border-neutral-600/40 bg-neutral-500/[0.08] text-neutral-300',
  Router: 'border-sky-500/30 bg-sky-500/[0.08] text-sky-300',
}

const SKILLS: { name: string; role: Role; icon: typeof Rocket; blurb: string }[] = [
  {
    name: 'using-shipyard',
    role: 'Router',
    icon: Compass,
    blurb: 'Entry point. Explains the journey and the main-wallet popup signing model, then routes to the right sub-skill.',
  },
  {
    name: 'deploy-on-shipyard',
    role: 'Wallet popup',
    icon: Rocket,
    blurb: 'Validate a Python Intelligent Contract, pick a network, and deploy. The user signs the deploy tx in their own wallet.',
  },
  {
    name: 'shipyard-registry',
    role: 'Autonomous',
    icon: Search,
    blurb: 'Browse and search the public contract registry: find contracts, check verified status, list by network. No wallet.',
  },
  {
    name: 'interact-with-contracts',
    role: 'Read · write popup',
    icon: Zap,
    blurb: 'Call contract methods. Reads run autonomously; writes are signed by the user’s wallet via a popup.',
  },
  {
    name: 'verify-contract-source',
    role: 'Gasless popup',
    icon: ShieldCheck,
    blurb: 'Publish a contract’s source as verified and optionally attribute it to your wallet, a gasless SIWE sign-in.',
  },
  {
    name: 'shipyard-networks',
    role: 'Reference',
    icon: Network,
    blurb: 'Networks (Bradbury, Asimov, Studionet, Localnet), faucets, wallet requirements, and supported AI models.',
  },
]

function CommandLine({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
      <code className="truncate font-mono text-xs text-emerald-300">{cmd}</code>
      <CopyButton value={cmd} label="Command" />
    </div>
  )
}

export default function SkillsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <h1 className="font-[Syne] text-3xl font-bold text-white">Shipyard Skills</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
          A Claude Code plugin that teaches agents the full Shipyard journey:{' '}
          <span className="text-neutral-200">deploy → discover → interact → verify</span> GenLayer
          Intelligent Contracts, straight from your CLI.
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white"
        >
          <Github size={14} />
          View on GitHub
        </a>
      </header>

      {/* Install */}
      <section className="mt-10 flex flex-col gap-3">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-emerald-400">
          Install
        </h2>
        <p className="text-sm text-neutral-400">
          In Claude Code, add the marketplace, then install the plugin:
        </p>
        <div className="flex flex-col gap-2">
          <CommandLine cmd={ADD_CMD} />
          <CommandLine cmd={INSTALL_CMD} />
        </div>
      </section>

      {/* Signing model */}
      <section className="mt-8">
        <Card variant="emerald" padding="md">
          <p className="text-sm leading-relaxed text-neutral-300">
            <span className="font-semibold text-emerald-300">Signing model:</span> you always sign
            with your <span className="text-white">own wallet</span> via a real browser popup. The
            agent prepares everything headlessly, then hands off for your approval. It never holds a
            key, and no private key or seed phrase is ever requested.
          </p>
        </Card>
      </section>

      {/* Skills */}
      <section className="mt-12 flex flex-col gap-4">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-emerald-400">
          The skills
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SKILLS.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.name} padding="md" className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon size={15} className="text-emerald-400" />
                    <code className="font-mono text-sm font-semibold text-white">{s.name}</code>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] ${ROLE_CLASS[s.role]}`}
                  >
                    {s.role}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-400">{s.blurb}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Footer note */}
      <p className="mt-12 text-xs leading-relaxed text-neutral-600">
        Shipyard pairs with GenLayer&apos;s own skills: it defers contract authoring to{' '}
        <code className="text-neutral-400">write-contract</code> and raw SDK reads to{' '}
        <code className="text-neutral-400">genlayer-cli</code>, and adds the deploy, interact, and
        verify flow with in-browser wallet signing.
      </p>
    </div>
  )
}
