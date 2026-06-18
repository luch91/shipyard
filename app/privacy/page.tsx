import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Shipyard — what data is and is not collected by the browser-based GenLayer deployment platform.',
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

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-[Syne] text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">Last updated: June 18, 2026</p>
      <p className="mt-1 text-xs text-amber-400/80">
        Shipyard is in public beta — this policy may change as the product evolves.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <Section title="Overview">
          <p>
            Shipyard is designed to be privacy-respecting. There are no user accounts, no passwords,
            and no email sign-up. Shipyard never receives, handles, or stores your private keys — all
            transactions are signed inside your own wallet, and Shipyard only receives the resulting
            signature.
          </p>
        </Section>

        <Section title="What We Store In Your Browser">
          <p>The following stay on your device (in localStorage) and are not sent to a Shipyard server:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>
              <span className="text-neutral-300">Wallet address</span> — persisted for UX continuity
              so the app remembers your connection.
            </li>
            <li>
              <span className="text-neutral-300">Deployment history</span> — records of contracts you
              deploy (address, network, name, and cached source) so you can revisit them. You can
              export, import, or clear this at any time.
            </li>
          </ul>
          <p>Clearing your browser data for genshipyard.com removes all of the above.</p>
        </Section>

        <Section title="What We Process">
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>
              <span className="text-neutral-300">Usage analytics</span> — privacy-respecting
              first-party analytics (for example page views and feature events). Wallet addresses
              are hashed before storage and never stored in raw form, and there are no third-party
              analytics trackers.
            </li>
            <li>
              <span className="text-neutral-300">AI contract generation (optional)</span> — if you use
              the AI generation feature, the prompt you enter is sent to a third-party AI provider
              (OpenRouter) to generate a contract. Do not include sensitive information in prompts.
            </li>
          </ul>
        </Section>

        <Section title="What We Do NOT Collect">
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>Private keys or seed phrases — never, under any circumstance.</li>
            <li>Passwords or account credentials — there are no accounts.</li>
            <li>Names, emails, or other personal identifiers, unless you voluntarily provide them.</li>
          </ul>
        </Section>

        <Section title="Third-Party Services">
          <p>
            Shipyard relies on third parties that may process limited data as part of providing the
            Service, including your wallet provider, GenLayer networks and RPC endpoints, the AI model
            provider used for optional generation (OpenRouter), and our database and hosting providers
            (Supabase and Vercel). Each is governed by its own privacy policy.
          </p>
        </Section>

        <Section title="Cookies & Tracking">
          <p>
            Shipyard uses minimal local storage and analytics as described above. It does not sell your
            data. Privacy and content-blocking tools may block analytics without affecting core
            deployment features.
          </p>
        </Section>

        <Section title="Your Choices">
          <p>
            You can disconnect your wallet, clear your browser&apos;s local storage to remove stored
            history and address, and use content blockers to prevent analytics. These actions do not
            prevent you from using the Service.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            This policy may be updated from time to time. Material changes will be reflected by the
            &quot;Last updated&quot; date above.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about privacy can be raised via the project repository at{' '}
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
