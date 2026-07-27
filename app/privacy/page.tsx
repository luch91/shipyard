import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Shipyard, a browser-based deployment platform for GenLayer Intelligent Contracts.',
  path: '/privacy',
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

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-[Syne] text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">Last updated: July 27, 2026</p>
      <p className="mt-1 text-xs text-amber-400/80">
        This policy describes the data that Shipyard processes through genshipyard.com.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <Section title="1. Scope">
          <p>
            This policy applies to the Shipyard website and service at genshipyard.com. It describes
            data processing that is present in the current application. Third-party services have
            their own privacy policies.
          </p>
          <p>
            Shipyard is an open-source project. The project repository is public. Do not post personal
            data, private keys, seed phrases, or passwords in public issues or pull requests.
          </p>
        </Section>

        <Section title="2. Data You Provide">
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>
              <span className="text-neutral-300">Wallet data</span> when you connect a wallet or use
              sign-in with Ethereum. The service receives your public wallet address and signature
              request data. It does not receive your private key or seed phrase.
            </li>
            <li>
              <span className="text-neutral-300">AI prompts</span> when you use contract generation.
              The prompt and selected model are sent to OpenRouter through the Shipyard server.
            </li>
            <li>
              <span className="text-neutral-300">Contract and transaction data</span> when you deploy,
              verify, or publish a contract. This can include an address, network, source, template,
              transaction hash, and deployment time.
            </li>
          </ul>
        </Section>

        <Section title="3. Data Stored In Your Browser">
          <p>Shipyard stores some data in browser storage:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>
              Deployment history, including contract addresses, networks, names, and cached source
              where the application saves it.
            </li>
            <li>A session identifier in sessionStorage for first-party analytics.</li>
            <li>Wallet connection state managed by the wallet and application libraries.</li>
          </ul>
          <p>
            Clear the site data for genshipyard.com to remove browser storage. This does not remove
            data already published to a blockchain or stored by a third-party service.
          </p>
        </Section>

        <Section title="4. Cookies">
          <p>
            Sign-in with Ethereum uses first-party, httpOnly cookies. A short-lived nonce cookie
            supports sign-in. A session cookie supports a signed-in wallet session for up to seven
            days. The admin area can use a separate signed admin session cookie for up to seven days.
          </p>
          <p>
            The cookies use the secure flag in production and use the same-site policy. Shipyard does
            not use advertising cookies.
          </p>
        </Section>

        <Section title="5. Analytics and Security Data">
          <p>
            Shipyard sends first-party event data for page views and feature events. An event can
            include the event name, path, network, template, contract address, limited metadata, a
            session identifier, and a user agent.
          </p>
          <p>
            When a wallet address is included, the server hashes it with a server-side salt before it
            stores the event. The raw wallet address is not stored in the analytics event record. If
            the salt is not configured, the event has no wallet attribution.
          </p>
          <p>
            Selected API endpoints receive a client IP address for rate limiting and abuse prevention.
            The application uses this value in rate-limit keys. The analytics event record does not
            store the raw client IP address. Hosting and service providers may process IP addresses
            in their own logs.
          </p>
        </Section>

        <Section title="6. Why We Process Data">
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>to provide wallet sign-in and transaction features;</li>
            <li>to generate contracts when you request the AI feature;</li>
            <li>to show public contract and deployment information;</li>
            <li>to show signed-in users their deployment history across devices;</li>
            <li>to measure feature use and improve the service;</li>
            <li>to prevent abuse and protect the service; and</li>
            <li>to maintain, secure, and operate the application.</li>
          </ul>
        </Section>

        <Section title="7. Service Providers">
          <p>Shipyard uses service providers to operate the application:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>Vercel for hosting and deployment;</li>
            <li>Supabase for database storage when configured;</li>
            <li>Upstash Redis for rate limits and short-lived relay data when configured;</li>
            <li>OpenRouter for optional AI contract generation;</li>
            <li>wallet providers and WalletConnect for wallet connection; and</li>
            <li>GenLayer networks and RPC providers for blockchain operations.</li>
          </ul>
          <p>
            Each provider processes data under its own terms and privacy policy. Review those policies
            before you use the related feature.
          </p>
        </Section>

        <Section title="8. Public Blockchain Data">
          <p>
            Blockchain transactions, contract addresses, contract source, and related data can be
            public and permanent. Shipyard cannot delete data from a public blockchain. Do not put
            personal or confidential information in a transaction or contract.
          </p>
        </Section>

        <Section title="9. Retention and Deletion">
          <p>
            Browser data remains until you clear it or the application removes it. Server data remains
            according to the configuration of Shipyard and its service providers. The current
            application does not publish one fixed retention period for all server records.
          </p>
          <p>
            Contact the project through the repository for a privacy question or a request about data
            held by the service. We may need information that identifies the relevant record. Do not
            send private keys, passwords, or other sensitive information.
          </p>
        </Section>

        <Section title="10. Your Choices and Rights">
          <p>
            You can disconnect your wallet, clear browser storage, avoid the AI feature, and use
            content blockers. These actions can limit some features but do not require you to share
            private keys or seed phrases.
          </p>
          <p>
            Privacy laws in your location may give you rights to access, correct, delete, restrict, or
            object to some processing. The available rights and response requirements depend on the
            applicable law and on the data involved.
          </p>
        </Section>

        <Section title="11. Children">
          <p>
            Shipyard is a developer tool. It is not directed to children. Do not use the service if
            you are not allowed to use it under the law that applies to you.
          </p>
        </Section>

        <Section title="12. Changes">
          <p>
            We may update this policy when the service or its data practices change. The date above
            shows when we last updated the policy. Review this page before you use the service after a
            change.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Send privacy questions through the project repository:
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