import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BLOG_POSTS,
  getBlogPost,
  getBlogExample,
  getContextualSiteNexisLinks,
  getRelatedBlogPosts,
  type BlogPillar,
} from '@/lib/blog/posts'
import { absoluteUrl, createPageMetadata, SITE_NAME } from '@/lib/metadata/site'

interface BlogPostPageProps {
  params: { slug: string }
}

const PILLAR_CONTEXT: Record<BlogPillar, string[]> = {
  'Intelligent Contracts': [
    'An Intelligent Contract keeps blockchain state deterministic. It contains variable AI and web work inside controlled non-deterministic blocks.',
    'The contract must define how validators assess a proposed result. This rule is part of the application design, not an optional implementation detail.',
  ],
  'AI and Blockchain': [
    'AI output can vary between executions. A blockchain cannot treat this output like a fixed arithmetic result.',
    'GenLayer separates proposal, validation, acceptance, appeal, and finality. This separation makes variable decisions compatible with shared contract state.',
  ],
  'Trust and Verification': [
    'Trust requires evidence, a validation rule, a visible state, and a method for disagreement. Agreement alone is not sufficient.',
    'A trustworthy application states what it measured and what it inferred. It also states when evidence is incomplete or unavailable.',
  ],
  'Developer Guides': [
    'A safe implementation starts with a narrow decision and a testable output contract. The prompt comes after these requirements.',
    'Developers must test source failure, malformed output, validator disagreement, and delayed finality. The successful path is only one test case.',
  ],
  'The Intelligent Internet': [
    'Software agents need stable interfaces, bounded authority, structured results, and verifiable state. A visual interface does not provide these controls.',
    'Public machine-readable information helps an agent discover a service. Contract rules then control what the agent can do with that service.',
  ],
}

const VERIFICATION_STEPS = [
  'State the decision in one sentence. Identify the person or system that uses the result.',
  'List each deterministic input, non-deterministic input, external source, and model dependency.',
  'Define the accepted output type, required fields, value limits, and failure states.',
  'Test correct input, malformed input, unavailable evidence, stale evidence, and conflicting evidence.',
  'Test validator agreement, validator disagreement, leader rotation, appeal, and finality where applicable.',
  'Confirm that no state change occurs before the contract obtains an acceptable result.',
  'Record the source, network, transaction state, and validation outcome for operational review.',
]

const REVIEW_QUESTIONS = [
  'Can fixed code complete this task without AI or web access?',
  'What evidence is necessary, and which source is authoritative for that evidence?',
  'What result must a validator reject?',
  'What does the application do when the result is partial or unavailable?',
  'Can a user distinguish an accepted result from a finalized result?',
  'What data must remain private?',
  'Which dependency can cause several validators to fail at the same time?',
]

const OPERATIONAL_CHECKS = [
  'Measure source, model, and network availability as separate signals.',
  'Measure response time for retrieval, model execution, validation, acceptance, and finality.',
  'Record rejected proposals, validator disagreement, leader rotation, and failed retries.',
  'Track source format changes and model configuration changes that can alter output.',
  'Review appeals and overturned results for weak criteria or missing evidence.',
  'Repeat the validation suite after a contract, prompt, source, model, or network change.',
]

const EVIDENCE_RECORD_FIELDS = [
  'Contract version and network identifier',
  'Transaction identifier and current transaction state',
  'Source identifier, retrieval time, and content version when available',
  'Model task, required output structure, and validation criteria',
  'Validator outcome, disagreement state, and appeal state',
  'Final application action and the authority that approved it',
]

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPost(params.slug)
  if (!post) return {}

  const metadata = createPageMetadata({
    title: `${post.title} | Shipyard`,
    description: post.description,
    path: `/blog/${post.slug}`,
    absoluteTitle: true,
  })

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: post.publishedAt,
      section: post.pillar,
    },
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  const articleUrl = absoluteUrl(`/blog/${post.slug}`)
  const contextualLinks = getContextualSiteNexisLinks(post)
  const example = getBlogExample(post.slug)
  const relatedPosts = getRelatedBlogPosts(post)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/icon.svg'),
      },
    },
    articleSection: post.pillar,
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex min-h-10 items-center text-sm font-medium text-neutral-500 hover:text-emerald-300"
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        All guides
      </Link>

      <header className="mt-6 border-b border-white/[0.08] pb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          {post.pillar}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-neutral-50 sm:text-5xl">
          {post.title}
        </h1>
      </header>

      <p className="mt-10 text-lg leading-8 text-neutral-300">{post.answer}</p>
      {contextualLinks.length > 0 && <p className="mt-4 text-base leading-8 text-neutral-400">
          For the AI retrieval context, read{' '}
          <a
            href={contextualLinks[0].href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-4 hover:text-emerald-300"
          >
            {contextualLinks[0].title}
          </a>
          . This resource explains how machines assess related public signals.
        </p>}

      <section className="mt-10" aria-labelledby="scope">
        <h2 id="scope" className="text-2xl font-semibold text-neutral-100">
          Scope and decision boundary
        </h2>
        <div className="mt-4 space-y-4 text-base leading-8 text-neutral-300">
          {PILLAR_CONTEXT[post.pillar].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            This guide defines the technical controls for this subject. It does
            not treat a model response as proof.
          </p>
          <p>
            Start with the decision boundary. Identify the permitted inputs, the
            required output, and the state change that can follow validation.
          </p>
          <p>
            This subject also connects to{' '}
            <Link className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-4 hover:text-emerald-300" href={`/blog/${relatedPosts[0].slug}`}>
              {relatedPosts[0].title}
            </Link>{' '}
            and{' '}
            <Link className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-4 hover:text-emerald-300" href={`/blog/${relatedPosts[1].slug}`}>
              {relatedPosts[1].title}
            </Link>. Read those guides together when the decision crosses trust,
            retrieval, or execution boundaries.
          </p>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="key-points">
        <h2 id="key-points" className="text-2xl font-semibold text-neutral-100">
          What changes in practice
        </h2>
        <div className="mt-4 space-y-6 text-base leading-8 text-neutral-300">
          {post.keyPoints.map((point, index) => (
            <div key={point}>
              <p className="text-neutral-200">{point}</p>
              <p className="mt-2 text-neutral-400">
                {index === 0
                  ? 'Treat this point as a design requirement. Record the input and the expected result before implementation.'
                  : index === 1
                    ? 'Connect this point to a visible contract state. A reviewer must be able to inspect the resulting behavior.'
                    : 'Test this point with normal, invalid, unavailable, and disputed inputs. Do not test only the successful path.'}
              </p>
            </div>
          ))}
        </div>
        {contextualLinks.length > 1 && <p className="mt-5 text-base leading-8 text-neutral-400">
          SiteNexis provides more context in{' '}
          <a
            href={contextualLinks[1].href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-4 hover:text-emerald-300"
          >
            {contextualLinks[1].title}
          </a>
          . Use this context to compare contract trust with content trust.
        </p>}
      </section>

      <section className="mt-10" aria-labelledby="design-guidance">
        <h2 id="design-guidance" className="text-2xl font-semibold text-neutral-100">
          Implementation in practice
        </h2>
        <div className="mt-4 space-y-6 text-base leading-8 text-neutral-300">
          {post.guidance.map((item, index) => (
            <div key={item}>
              <p>{item}</p>
              <p className="mt-2 text-neutral-500">
                  Document the owner, input, output, failure response, and test
                  evidence for this control.
              </p>
            </div>
          ))}
        </div>
        {contextualLinks.length > 2 && <p className="mt-5 text-base leading-8 text-neutral-400">
          The guide{' '}
          <a
            href={contextualLinks[2].href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-4 hover:text-emerald-300"
          >
            {contextualLinks[2].title}
          </a>{' '}
          explains the related discovery layer. It connects application design
          to machine-readable evidence.
        </p>}
      </section>

      {example && (
        <section className="mt-10" aria-labelledby="example-scenario">
          <h2 id="example-scenario" className="text-2xl font-semibold text-neutral-100">
            {example.title}
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-neutral-300">
            {example.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="verification-procedure">
        <h2 id="verification-procedure" className="text-2xl font-semibold text-neutral-100">
          Verification procedure
        </h2>
        <p className="mt-4 text-base leading-8 text-neutral-300">
          Use this procedure before deployment. Keep the test evidence with the
          contract version and network configuration.
        </p>
        <ol className="mt-5 space-y-4">
          {VERIFICATION_STEPS.map((step, index) => (
            <li key={step} className="flex gap-4 text-base leading-7 text-neutral-300">
              <span className="font-mono text-sm text-emerald-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="design-review">
        <h2 id="design-review" className="text-2xl font-semibold text-neutral-100">
          Design review questions
        </h2>
        <p className="mt-4 text-base leading-8 text-neutral-300">
          A reviewer must answer these questions before the contract handles a
          high-impact decision.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {REVIEW_QUESTIONS.map((question) => (
            <li
              key={question}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 text-sm leading-6 text-neutral-300"
            >
              {question}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="evidence-record">
        <h2 id="evidence-record" className="text-2xl font-semibold text-neutral-100">
          Evidence record
        </h2>
        <p className="mt-4 text-base leading-8 text-neutral-300">
          Keep enough evidence to reproduce the application decision. Do not
          store private input in a public contract record.
        </p>
        <dl className="mt-5 divide-y divide-white/[0.06] rounded-lg border border-white/[0.07]">
          {EVIDENCE_RECORD_FIELDS.map((field, index) => (
            <div key={field} className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-mono text-xs uppercase tracking-wide text-neutral-600">
                Field {index + 1}
              </dt>
              <dd className="text-sm leading-6 text-neutral-300">{field}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="operations">
        <h2 id="operations" className="text-2xl font-semibold text-neutral-100">
          Operational monitoring
        </h2>
        <p className="mt-4 text-base leading-8 text-neutral-300">
          Deployment is not the end of verification. Monitor the complete
          decision path and investigate changes in behavior.
        </p>
        <ul className="mt-5 space-y-3">
          {OPERATIONAL_CHECKS.map((check) => (
            <li key={check} className="flex gap-3 text-base leading-7 text-neutral-300">
              <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{check}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="release-criteria">
        <h2 id="release-criteria" className="text-2xl font-semibold text-neutral-100">
          Release criteria
        </h2>
        <div className="mt-4 space-y-4 text-base leading-8 text-neutral-300">
          <p>
            Release the contract only when the team can explain each input,
            validation rule, state change, failure response, and authority boundary.
          </p>
          <p>
            The test suite must include evidence failure and validator disagreement.
            A successful example does not prove safe behavior.
          </p>
          <p>
            The interface must show the correct transaction state. It must not
            describe an accepted result as final before the finality process ends.
          </p>
          <p>
            The operating team must have a response procedure for provider failure,
            source change, disputed results, and contract defects.
          </p>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="limits">
        <h2 id="limits" className="text-2xl font-semibold text-neutral-100">
          Limits
        </h2>
        <ul className="mt-4 space-y-3">
          {post.limits.map((limit) => (
            <li key={limit} className="flex gap-3 text-base leading-7 text-neutral-300">
              <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <span>{limit}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="primary-sources">
        <h2 id="primary-sources" className="text-lg font-semibold text-neutral-100">
          Primary GenLayer sources
        </h2>
        <ul className="mt-3 space-y-2">
          {post.sources.map((source, index) => (
            <li key={source.href} className="text-sm leading-7 text-neutral-400">
              {index === 0
                ? 'Use the official '
                : 'Compare the implementation with '}
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 underline decoration-neutral-700 underline-offset-4 hover:text-neutral-200"
              >
                {source.title}
              </a>
              {index === 0
                ? ' page as the primary protocol reference for this subject.'
                : ' before you select the final validation and failure rules.'}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-7 text-neutral-500">
          Check the source pages again before production deployment. Protocol,
          network, and software requirements can change.
        </p>
      </section>
    </article>
  )
}
