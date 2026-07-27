import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Terms of Service',
  description:
    'Terms of Service for Shipyard, a browser-based deployment platform for GenLayer Intelligent Contracts.',
  path: '/terms',
})

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
      <p className="mt-2 font-mono text-xs text-neutral-500">Last updated: July 27, 2026</p>
      <p className="mt-1 text-xs text-amber-400/80">
        Shipyard is in public beta. These terms may change as the service develops.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <Section title="1. Agreement">
          <p>
            These Terms of Service apply when you access or use Shipyard at genshipyard.com. By using
            Shipyard, you agree to these terms. If you do not agree, do not use the service.
          </p>
          <p>
            You must have the legal capacity to accept these terms. You must follow all laws that
            apply to your use of the service.
          </p>
        </Section>

        <Section title="2. The Service">
          <p>
            Shipyard is a browser tool. It helps you deploy and interact with GenLayer Intelligent
            Contracts. It can also provide contract templates, optional AI contract generation,
            contract verification, a public contract registry, and deployment history.
          </p>
          <p>
            Shipyard connects to wallets, GenLayer networks, RPC endpoints, hosting providers,
            database services, rate limit services, and other providers. Some features may be
            unavailable when a provider is unavailable or not configured.
          </p>
        </Section>

        <Section title="3. Wallets and Transactions">
          <p>
            Shipyard does not hold your private keys or custody your funds. Your wallet signs the
            transactions that you approve. Shipyard does not control your wallet.
          </p>
          <p>
            You are responsible for your wallet, keys, device, network selection, contract source,
            constructor values, transaction details, gas, and tokens. Check all details before you
            sign. Blockchain transactions can be public and irreversible.
          </p>
          <p>
            GenLayer networks may be testnets or experimental networks. A network can reset, change,
            stop, or become unavailable. Shipyard does not promise that a transaction will succeed or
            remain available.
          </p>
        </Section>

        <Section title="4. AI Features and User Content">
          <p>
            If you use AI contract generation, Shipyard sends your description and selected model to
            OpenRouter. The generated code can contain errors, unsafe behavior, or unsupported
            features. You must review and test all generated code before you use or deploy it.
          </p>
          <p>
            Do not send private keys, seed phrases, passwords, or other sensitive information to an
            AI feature. You are responsible for the code, prompts, contracts, and other content that
            you submit, deploy, or publish.
          </p>
          <p>
            You keep your rights in content that you create, unless another agreement applies. You
            must have the rights needed to submit, deploy, or publish that content.
          </p>
        </Section>

        <Section title="5. Public Networks and Third Parties">
          <p>
            Blockchain networks, wallet providers, RPC endpoints, AI providers, hosting providers,
            database providers, and other third parties operate under their own terms and policies.
            Shipyard does not control their services or content.
          </p>
          <p>
            A contract or transaction that you publish to a public network may be visible to other
            people. Do not publish information that you need to keep private.
          </p>
        </Section>

        <Section title="6. Acceptable Use">
          <p>You must not use Shipyard to:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>break the law or help another person break the law;</li>
            <li>deploy malware, fraud, or a harmful contract;</li>
            <li>infringe another person&apos;s rights;</li>
            <li>attack, disrupt, overload, or bypass security controls; or</li>
            <li>access data or systems without permission.</li>
          </ul>
        </Section>

        <Section title="7. Open Source and Intellectual Property">
          <p>
            Shipyard source code is released under the MIT License. The license for the source code
            does not transfer rights in third-party software, networks, trademarks, or content.
          </p>
          <p>
            You are responsible for the contracts, code, prompts, and other content that you submit or
            deploy. You must not submit content that you do not have permission to use.
          </p>
        </Section>

        <Section title="8. Availability and Warranty">
          <p>
            Shipyard is provided as is and as available, to the maximum extent allowed by law. We do
            not promise that the service will be secure, continuous, error-free, or suitable for a
            particular purpose.
          </p>
          <p>
            Shipyard is a development tool. It is not legal, financial, investment, tax, security, or
            other professional advice.
          </p>
        </Section>

        <Section title="9. Liability">
          <p>
            To the maximum extent allowed by law, Shipyard and its contributors are not liable for
            indirect, incidental, special, consequential, or exemplary loss. This includes loss of
            funds, tokens, profits, data, contracts, or digital assets that results from use of the
            service, a transaction, a network, a wallet, generated code, or a third-party service.
          </p>
          <p>
            Nothing in these terms excludes or limits liability that the law does not allow us to
            exclude or limit.
          </p>
        </Section>

        <Section title="10. Changes and Suspension">
          <p>
            We may change, suspend, or remove all or part of Shipyard at any time. We may also limit
            access when needed to protect the service, users, third parties, or networks.
          </p>
          <p>
            We may update these terms by posting a new version on this page. The date above shows when
            we last updated the terms. Your continued use of Shipyard after an update means that you
            accept the updated terms.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Send questions about these terms through the project repository:
          </p>
          <a
            href="https://github.com/luch91/shipyard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            github.com/luch91/shipyard
          </a>
          <p>Do not post private keys, passwords, or other sensitive information in a public issue.</p>
        </Section>
      </div>
    </article>
  )
}