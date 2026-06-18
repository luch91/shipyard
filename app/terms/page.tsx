import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for Shipyard — the browser-based deployment platform for GenLayer Intelligent Contracts.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-emerald-400">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-[Syne] text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">Last updated: June 18, 2026</p>
      <p className="mt-1 text-xs text-amber-400/80">
        Shipyard is in public beta — these terms may change as the product evolves.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <Section title="1. Acceptance">
          <p>
            By accessing or using Shipyard (the &quot;Service&quot;), available at genshipyard.com,
            you agree to these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. The Service">
          <p>
            Shipyard is a browser-based tool for deploying and interacting with GenLayer Intelligent
            Contracts. It connects to your self-custodied wallet to request transaction signatures.
            Shipyard does not custody your funds, does not hold or have access to your private keys,
            and does not act as a broker, exchange, or financial intermediary.
          </p>
        </Section>

        <Section title="3. No Warranty">
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot;, without warranties
            of any kind, express or implied. Shipyard is open-source software released under the MIT
            License and is experimental in nature. Blockchain networks it connects to may be testnets
            or experimental environments that can change, reset, or become unavailable at any time.
          </p>
        </Section>

        <Section title="4. Wallets, Transactions & Funds">
          <p>
            You are solely responsible for your wallet, your keys, the security of your device, and
            every transaction you authorize. Blockchain transactions are generally irreversible. You
            are responsible for verifying the target network, contract source, constructor parameters,
            and any gas or token costs before signing. Shipyard is not liable for losses arising from
            transactions you authorize, network conditions, or smart-contract behavior.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>
            You agree not to use the Service to deploy or distribute unlawful, fraudulent, or
            malicious contracts, to infringe others&apos; rights, or to attempt to disrupt, attack, or
            gain unauthorized access to the Service or the networks it connects to.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            Shipyard&apos;s source code is open-source under the MIT License. Contracts, code, and
            content you create or deploy remain yours. You are responsible for ensuring you have the
            rights to any material you submit to the Service.
          </p>
        </Section>

        <Section title="7. Third-Party Services">
          <p>
            The Service relies on third parties including wallet providers, GenLayer networks and RPC
            endpoints, AI model providers (for optional contract generation), hosting, and analytics.
            Your use of those services is governed by their respective terms and policies. Shipyard is
            not responsible for third-party availability or conduct.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Shipyard and its contributors shall not be liable
            for any indirect, incidental, special, consequential, or exemplary damages, or for any
            loss of profits, funds, data, or digital assets, arising from your use of the Service.
          </p>
        </Section>

        <Section title="9. Changes">
          <p>
            These Terms may be updated from time to time. Continued use of the Service after changes
            take effect constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about these Terms can be raised via the project repository at{' '}
            <a
              href="https://github.com/luch91/shipyard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              github.com/luch91/shipyard
            </a>
            .
          </p>
        </Section>
      </div>
    </article>
  )
}
