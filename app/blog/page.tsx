import Link from 'next/link'
import { BLOG_PILLARS, BLOG_POSTS } from '@/lib/blog/posts'
import { createPageMetadata } from '@/lib/metadata/site'

export const metadata = createPageMetadata({
  title: 'GenLayer Knowledge Center | Shipyard',
  description:
    'Technical guides about Intelligent Contracts, AI consensus, machine trust, verifiable decisions, and the intelligent internet.',
  path: '/blog',
  absoluteTitle: true,
})

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
          GenLayer Knowledge Center
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">
          Build systems that can reason and earn trust.
        </h1>
        <p className="mt-5 text-base leading-7 text-neutral-400 sm:text-lg">
          Read technical guides about Intelligent Contracts, AI consensus,
          verifiable decisions, machine trust, and agent-ready applications.
        </p>
      </header>

      <div className="mt-14 space-y-14">
        {BLOG_PILLARS.map((pillar) => {
          const posts = BLOG_POSTS.filter((post) => post.pillar === pillar)
          if (posts.length === 0) return null

          return (
            <section key={pillar} aria-labelledby={`pillar-${pillar}`}>
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/[0.08] pb-3">
                <h2
                  id={`pillar-${pillar}`}
                  className="text-xl font-semibold text-neutral-100"
                >
                  {pillar}
                </h2>
                <span className="font-mono text-xs text-neutral-600">
                  {posts.length} {posts.length === 1 ? 'guide' : 'guides'}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-emerald-400/25 hover:bg-emerald-400/[0.03]"
                  >
                    <h3 className="text-lg font-semibold leading-7 text-neutral-100">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors hover:text-emerald-300"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-500">
                      {post.pillar} technical guide. Read the full analysis for
                      implementation decisions, failure cases, and evidence.
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-5 inline-flex min-h-10 items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      Read guide
                      <span aria-hidden="true" className="ml-2">
                        →
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
