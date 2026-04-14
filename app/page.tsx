import Link from 'next/link'
import { ArrowRight, Upload, Settings, Rocket, ExternalLink } from 'lucide-react'
import { getAllNetworks } from '@/lib/genlayer/networks'
import { NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import type { NetworkId } from '@/types'

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 font-mono text-sm font-bold text-emerald-400">
          {step}
        </span>
        <Icon size={18} className="text-neutral-400" />
      </div>
      <h3 className="font-mono font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const networks = getAllNetworks()

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* ── Hero ── */}
      <section className="mb-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-mono text-xs text-emerald-400">Bradbury Testnet Live</span>
        </div>

        <h1 className="mb-4 font-mono text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Deploy Intelligent Contracts
          <br />
          <span className="text-emerald-400">in 60 seconds.</span>
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-neutral-500">
          Shipyard is the no-CLI deployment platform for{' '}
          <span className="text-neutral-300">GenLayer Intelligent Contracts</span>. Upload your
          Python contract, pick a network, and deploy — no terminal required.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/deploy"
            className="flex items-center gap-2 rounded-md bg-emerald-500 px-6 py-3 font-mono font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Start Deploying
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-2 rounded-md border border-neutral-700 px-6 py-3 font-mono font-semibold text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          >
            Browse Templates
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mb-20">
        <h2 className="mb-8 text-center font-mono text-xl font-bold text-white">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StepCard
            step={1}
            icon={Upload}
            title="Upload your contract"
            description="Paste or drop a Python Intelligent Contract file. Shipyard parses the constructor params automatically."
          />
          <StepCard
            step={2}
            icon={Settings}
            title="Configure parameters"
            description="Fill in constructor arguments with a typed form — no JSON wrangling or CLI flags."
          />
          <StepCard
            step={3}
            icon={Rocket}
            title="Deploy to any network"
            description="Choose Bradbury, Asimov, Studionet, or Localnet. One click deploys and streams live logs."
          />
        </div>
      </section>

      {/* ── Network status bar ── */}
      <section>
        <h2 className="mb-4 font-mono text-sm font-semibold text-neutral-500 uppercase tracking-widest">
          Networks
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {networks.map((network) => {
            const colors = NETWORK_COLOR_CLASSES[network.id as NetworkId]
            return (
              <div
                key={network.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
              >
                <span
                  className={`h-2 w-2 rounded-full ${colors.dot} ${network.isLive ? 'animate-pulse' : 'opacity-40'}`}
                />
                <span className={`font-mono text-xs font-medium ${colors.text}`}>
                  {network.name}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
          <span>Need testnet tokens?</span>
          <a
            href="https://testnet-faucet.genlayer.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 hover:underline"
          >
            Bradbury / Asimov Faucet
            <ExternalLink size={11} />
          </a>
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-400 hover:underline"
          >
            GenLayer Docs
            <ExternalLink size={11} />
          </a>
        </div>
      </section>
    </div>
  )
}
