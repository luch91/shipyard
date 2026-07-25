export const BLOG_PILLARS = [
  'Intelligent Contracts',
  'AI and Blockchain',
  'Trust and Verification',
  'Developer Guides',
  'The Intelligent Internet',
] as const

export type BlogPillar = (typeof BLOG_PILLARS)[number]

export interface BlogLink {
  title: string
  href: string
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  pillar: BlogPillar
  publishedAt: string
  answer: string
  keyPoints: string[]
  guidance: string[]
  limits: string[]
  siteNexisLinks: BlogLink[]
  sources: BlogLink[]
}

const sitenexis = (slug: string, title: string): BlogLink => ({
  title,
  href: `https://sitenexis.vercel.app/blog/${slug}`,
})

const FOUNDATION_SITE_NEXIS_LINKS = [
  sitenexis('machine-trust-is-not-ai-visibility', 'Machine Trust Is Not AI Visibility'),
  sitenexis('building-for-machine-consumers', 'Building for Machine Consumers'),
  sitenexis('how-ai-agents-browse-and-trust-the-web', 'How AI Agents Browse and Trust the Web'),
  sitenexis('retrieval-simulation-six-stages-where-ai-drops-your-content', 'Retrieval Simulation'),
  sitenexis('graceful-truth-layer-api-design', 'The Graceful Truth Layer'),
]

const SITENEXIS_ARTICLE_SLUGS = new Set([
  'why-intelligent-contracts-need-machine-trust',
  'trustworthy-ai-applications-with-genlayer',
  'how-ai-search-discovers-blockchain-applications',
  'ai-visibility-for-web3',
])

export interface BlogExample {
  title: string
  paragraphs: string[]
}

const BLOG_EXAMPLES: Record<string, BlogExample> = {
  'why-intelligent-contracts-need-machine-trust': {
    title: 'Example: a contract that approves a supplier',
    paragraphs: [
      'A procurement contract can ask whether a supplier meets a published policy. Consensus can confirm that validators accepted the same decision. Machine trust requires more detail: the contract must record the policy version, evidence source, retrieval time, and validation rule.',
      'If the supplier page changes during the finality window, the application must not silently treat the new page as the original evidence. It should show the recorded observation, the transaction state, and the response available to a participant who disputes the result.',
    ],
  },
  'when-smart-contracts-can-reason': {
    title: 'Example: classifying a support request',
    paragraphs: [
      'A support contract can classify a request as urgent, normal, or outside policy. The model may use language that does not match another validator word for word. A non-comparative validation rule can check whether the proposed class follows the policy and includes the required reason.',
      'The contract should store the accepted class and policy identifier. It should not store an unbounded model conversation as contract state. This boundary keeps the state small and makes the decision easier to review.',
    ],
  },
  'trustworthy-ai-applications-with-genlayer': {
    title: 'Example: a claims review workflow',
    paragraphs: [
      'A claims application can retrieve a document, extract required fields, and ask validators to assess whether the claim meets a policy. The application must separate extraction, evidence validation, and the final settlement decision.',
      'When a document is missing a required field, the safe result is an incomplete claim. It is not a rejected claim and it is not an approved claim. The interface must show this distinction to the reviewer.',
    ],
  },
  'how-ai-search-discovers-blockchain-applications': {
    title: 'Example: an agent searches for a contract service',
    paragraphs: [
      'An agent that searches for a contract service needs more than a product name. It needs a stable service description, supported networks, method names, permission rules, source documentation, and a clear way to identify failures.',
      'A page that explains these facts in complete sections gives the agent useful retrieval units. A page that only shows a wallet button forces the agent to infer the service from missing information.',
    ],
  },
  'ai-visibility-for-web3': {
    title: 'Example: a strong protocol with weak public evidence',
    paragraphs: [
      'A protocol can have audited contracts and active users but still provide poor evidence for AI retrieval. Its documentation may use several names for the same network, omit the contract purpose, or place important facts only inside a client-side application.',
      'The improvement is not a larger keyword list. The improvement is a connected evidence system with named entities, primary sources, stable pages, and direct explanations that another system can quote without guessing.',
    ],
  },
  'equivalence-principle-validates-ai-output': {
    title: 'Example: a model returns three valid summaries',
    paragraphs: [
      'Three validators can summarize the same policy with different sentences. Strict equality would reject the results even when they express the same required conditions. A criteria-based validator can check the required facts, prohibited claims, and output structure instead.',
      'The criteria must be narrow enough to test. A rule such as "the summary should be good" does not define a safe equivalence boundary.',
    ],
  },
  'safe-failure-states-for-intelligent-contracts': {
    title: 'Example: a pricing source stops responding',
    paragraphs: [
      'A contract that uses a price source can receive a timeout instead of a price. The timeout is evidence that the operation did not complete. It must not become a zero price or a successful result.',
      'A safe application keeps the last accepted value, records the failed observation, and lets the caller retry under a defined policy. This makes the failure visible without corrupting state.',
    ],
  },
  'appeals-and-finality-for-ai-decisions': {
    title: 'Example: a delivery dispute after provisional acceptance',
    paragraphs: [
      'A delivery contract can accept a result that a package meets the stated policy. During the finality window, a participant can submit contrary evidence. The application must keep the settlement provisional until the appeal window closes.',
      'If an appeal overturns the result, the system must follow a defined compensation or reversal procedure. This procedure must exist before the first transaction is submitted.',
    ],
  },
  'prompt-injection-in-web-connected-contracts': {
    title: 'Example: an instruction hidden in a web page',
    paragraphs: [
      'A contract retrieves a page to extract a product price. The page contains text that instructs the model to ignore the extraction task and approve a transaction. That text is untrusted evidence, not a contract instruction.',
      'The prompt must delimit the page content, request only the price field, and reject output that contains commands or unexpected fields. Validators must apply the same output rule.',
    ],
  },
  'web-evidence-for-intelligent-contracts': {
    title: 'Example: two validators see different page versions',
    paragraphs: [
      'A source can update between two validator requests. One validator may see an old price and another may see a new price. The contract needs a tolerance rule, a versioned source, or a safe disagreement state.',
      'The application should record the observation time and the normalized fact. It should not claim that both validators saw identical page content when they did not.',
    ],
  },
  'agent-to-agent-dispute-resolution': {
    title: 'Example: an agent claims that a service was not delivered',
    paragraphs: [
      'A buyer agent can submit a service request and a seller agent can submit delivery evidence. An Intelligent Contract can compare the evidence with the agreed service criteria and hold settlement during the appeal window.',
      'The contract cannot decide facts that the agreement does not define. The parties must state the evidence window, acceptable proof, exception process, and authority for a final decision.',
    ],
  },
}

const genlayer = {
  introduction: {
    title: 'Introduction to Intelligent Contracts',
    href: 'https://docs.genlayer.com/developers/intelligent-contracts/introduction',
  },
  consensus: {
    title: 'How GenLayer Works',
    href: 'https://docs.genlayer.com/understand-genlayer-protocol/optimistic-democracy-how-genlayer-works',
  },
  democracy: {
    title: 'Optimistic Democracy',
    href: 'https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/optimistic-democracy',
  },
  nondeterminism: {
    title: 'Non-determinism',
    href: 'https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism',
  },
  llms: {
    title: 'Calling LLMs',
    href: 'https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms',
  },
  web: {
    title: 'Web Access',
    href: 'https://docs.genlayer.com/developers/intelligent-contracts/features/web-access',
  },
} satisfies Record<string, BlogLink>

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-intelligent-contracts-need-machine-trust',
    title: 'Why Intelligent Contracts Need Machine Trust, Not Only Consensus',
    description: 'Learn why consensus confirms an outcome but does not explain the quality of the data, models, and rules behind it.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'Consensus records agreement. Machine trust explains why a system should accept the process that produced that agreement. Intelligent Contracts need both controls because AI and web data can produce variable results.',
    keyPoints: [
      'Validators can agree on a result even when the input source is weak.',
      'The Equivalence Principle defines how validators compare variable results.',
      'Appeals give users a method to challenge a provisionally accepted result.',
    ],
    guidance: [
      'Define acceptable evidence before the contract calls an AI model or a web source.',
      'Record the source, validation rule, and failure state for each decision.',
      'Use exact comparison only when normalized outputs must be identical.',
    ],
    limits: [
      'A trust score cannot prove that an external fact is true.',
      'A validator majority does not remove model bias or source bias.',
    ],
    siteNexisLinks: [
      sitenexis('machine-trust-score-replacing-domain-authority', 'What Is Machine Trust Score and Why It Is Replacing Domain Authority'),
      sitenexis('machine-trust-score-how-ai-forms-confidence-in-your-domain', 'Machine Trust Score: How AI Systems Form Confidence in Your Domain'),
    ],
    sources: [genlayer.democracy, genlayer.consensus],
  },
  {
    slug: 'explainability-for-ai-native-blockchains',
    title: 'Why Explainability Is Important for AI-Native Blockchains',
    description: 'See how explicit states, evidence, and validation rules make AI-assisted blockchain decisions easier to inspect.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'An AI-native blockchain must show what happened, what evidence was available, and how validators assessed the result. A transaction status alone does not explain an AI-assisted decision.',
    keyPoints: [
      'A clear result state separates complete, partial, and unavailable evidence.',
      'A validation rule tells reviewers what the contract considered acceptable.',
      'An appeal path gives users a defined response to a disputed result.',
    ],
    guidance: [
      'Return explicit error states when an external source is unavailable.',
      'Keep source facts separate from model conclusions.',
      'Write validation criteria that another developer can test.',
    ],
    limits: [
      'An explanation can describe a process without proving that the conclusion is correct.',
      'Do not expose private input data in logs or public state.',
    ],
    siteNexisLinks: [
      sitenexis('graceful-truth-layer-api-design', 'The Graceful Truth Layer'),
      sitenexis('gtl-api-honesty-contracts', 'API Honesty Contracts'),
    ],
    sources: [genlayer.nondeterminism, genlayer.democracy],
  },
  {
    slug: 'when-smart-contracts-can-reason',
    title: 'What Happens When Smart Contracts Can Reason?',
    description: 'Understand how Intelligent Contracts use language models and web data without treating model output as deterministic code.',
    pillar: 'AI and Blockchain',
    publishedAt: '2026-07-25',
    answer: 'A reasoning contract can evaluate language, compare evidence, and use web data. The contract must contain this variable work in a non-deterministic block. Validators then assess the proposed result.',
    keyPoints: [
      'Language model output can vary between validators.',
      'Deterministic state changes occur after validators agree on a result.',
      'The contract developer defines the comparison or validation rule.',
    ],
    guidance: [
      'Use structured model output when the contract needs specific fields.',
      'Reject malformed output before it can change contract state.',
      'Keep prompts narrow and define the evidence that the model can use.',
    ],
    limits: [
      'Reasoning does not give a contract general intelligence.',
      'External model and data services can add cost, delay, and failure modes.',
    ],
    siteNexisLinks: [
      sitenexis('beyond-rankings-how-ai-evaluates-content-2026', 'How AI Systems Evaluate Content'),
      sitenexis('how-ai-agents-browse-and-trust-the-web', 'How AI Agents Browse and Trust the Web'),
    ],
    sources: [genlayer.introduction, genlayer.llms],
  },
  {
    slug: 'intelligent-contracts-vs-smart-contracts',
    title: 'Intelligent Contracts Compared with Traditional Smart Contracts',
    description: 'Compare deterministic smart contract execution with GenLayer contracts that can use AI and external web data.',
    pillar: 'Intelligent Contracts',
    publishedAt: '2026-07-25',
    answer: 'Traditional smart contracts normally require deterministic inputs and execution. Intelligent Contracts can use variable AI and web results. GenLayer adds validation rules and consensus for this variable work.',
    keyPoints: [
      'Both contract types keep deterministic state on a blockchain.',
      'Intelligent Contracts contain variable operations in special blocks.',
      'Validators can compare meaning or apply custom validation criteria.',
    ],
    guidance: [
      'Use deterministic code for calculations that do not need AI or web access.',
      'Use an Intelligent Contract when the decision requires language or changing external data.',
      'Document the additional cost and latency of each variable operation.',
    ],
    limits: [
      'Intelligent Contracts are not a replacement for all deterministic contracts.',
      'A wider input surface requires more testing and stronger failure handling.',
    ],
    siteNexisLinks: [
      sitenexis('four-layer-ai-intelligence-stack-seo', 'The Four-Layer AI Intelligence Stack'),
      sitenexis('building-for-machine-consumers', 'Building for Machine Consumers'),
    ],
    sources: [genlayer.introduction, genlayer.nondeterminism],
  },
  {
    slug: 'why-ai-needs-verifiable-execution',
    title: 'Why AI Needs Verifiable Execution',
    description: 'Learn how independent execution and explicit validation rules can make AI-assisted decisions more accountable.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'AI output is variable and can be difficult to audit. Verifiable execution gives independent validators the same task and a defined rule for assessment. It does not make the model deterministic.',
    keyPoints: [
      'A leader proposes a result.',
      'Other validators execute or assess the task independently.',
      'The network records agreement and provides an appeal window.',
    ],
    guidance: [
      'Define what evidence a validator must check.',
      'Reject results that do not match the required structure.',
      'Store only the agreed result in deterministic contract state.',
    ],
    limits: [
      'Verification quality depends on the validation criteria.',
      'Independent execution can still use correlated models or sources.',
    ],
    siteNexisLinks: [
      sitenexis('machine-trust-is-not-ai-visibility', 'Machine Trust Is Not AI Visibility'),
      sitenexis('bridge-machine-trust-gtl', 'Machine Trust and the Graceful Truth Layer'),
    ],
    sources: [genlayer.consensus, genlayer.nondeterminism],
  },
  {
    slug: 'trustworthy-ai-applications-with-genlayer',
    title: 'How to Build Trustworthy AI Applications with GenLayer',
    description: 'Use bounded prompts, explicit evidence, validation criteria, and safe state changes in a GenLayer application.',
    pillar: 'Developer Guides',
    publishedAt: '2026-07-25',
    answer: 'A trustworthy GenLayer application limits the AI task, identifies its sources, validates the output, and changes state only after consensus. The user must also understand incomplete and disputed results.',
    keyPoints: [
      'Trust starts with a small and testable decision scope.',
      'Source quality and source availability affect the result.',
      'The user interface must not present a provisional result as final.',
    ],
    guidance: [
      'Write separate leader and validator responsibilities.',
      'Test valid, invalid, partial, and unavailable source states.',
      'Show the network and transaction state to the user.',
    ],
    limits: [
      'Consensus cannot correct an ambiguous product requirement.',
      'A model can produce a plausible result that fails the intended policy.',
    ],
    siteNexisLinks: [
      sitenexis('building-citation-authority-ai-systems', 'Building Citation Authority for AI Systems'),
      sitenexis('entity-optimization-the-signal-ai-systems-weight-most', 'Entity Optimization'),
    ],
    sources: [genlayer.llms, genlayer.democracy],
  },
  {
    slug: 'ai-business-decisions-vs-traditional-code',
    title: 'Can AI Make Better Business Decisions Than Traditional Code?',
    description: 'Choose between fixed business rules and AI-assisted judgment with clear technical criteria.',
    pillar: 'AI and Blockchain',
    publishedAt: '2026-07-25',
    answer: 'AI can help when a decision depends on language, context, or changing evidence. Traditional code is better when the rule is stable, complete, and numeric. Many systems need both methods.',
    keyPoints: [
      'Fixed code gives repeatable results for defined inputs.',
      'AI can assess information that does not fit a fixed rule set.',
      'A GenLayer contract can validate the AI result before it changes state.',
    ],
    guidance: [
      'Start with deterministic rules and add AI only for unresolved judgment.',
      'Define a measurable acceptance rule for the AI output.',
      'Track false acceptance and false rejection during testing.',
    ],
    limits: [
      'A model does not know the business policy unless the task states it.',
      'A more flexible decision can be harder to predict and explain.',
    ],
    siteNexisLinks: [
      sitenexis('recommendation-surface-mapping-where-ai-includes-or-excludes-you', 'Recommendation Surface Mapping'),
      sitenexis('citation-probability-what-makes-ai-systems-cite-your-content', 'Citation Probability'),
    ],
    sources: [genlayer.introduction, genlayer.llms],
  },
  {
    slug: 'multi-agent-ai-for-decentralised-applications',
    title: 'How Multi-Agent AI Can Protect Decentralised Applications',
    description: 'Learn how independent evaluators can reduce reliance on one model, operator, or decision path.',
    pillar: 'AI and Blockchain',
    publishedAt: '2026-07-25',
    answer: 'Multiple independent evaluators can test a proposed result from different execution contexts. GenLayer uses a leader and validators for this purpose. Independence and clear criteria are necessary.',
    keyPoints: [
      'A leader produces the proposed result.',
      'Validators independently assess the proposal.',
      'Appeals add more validators when a user disputes the result.',
    ],
    guidance: [
      'Avoid a shared dependency that can fail all evaluators at the same time.',
      'Give validators a precise acceptance rule.',
      'Record disagreement as a normal state, not as an unexpected error.',
    ],
    limits: [
      'More agents do not guarantee independent evidence.',
      'Coordination adds execution time and cost.',
    ],
    siteNexisLinks: [
      sitenexis('multi-agent-orchestration-and-content-intelligence', 'Multi-Agent Orchestration'),
      sitenexis('how-sitenexis-runs-16-autonomous-agents-in-a-single-audit', 'How SiteNexis Runs 16 Autonomous Agents in a Single Audit'),
    ],
    sources: [genlayer.consensus, genlayer.democracy],
  },
  {
    slug: 'why-deterministic-code-is-not-enough',
    title: 'Why Deterministic Code Is Not Sufficient for Modern AI',
    description: 'See where deterministic code remains essential and where AI-assisted decisions require controlled non-determinism.',
    pillar: 'Developer Guides',
    publishedAt: '2026-07-25',
    answer: 'Deterministic code cannot directly resolve every language or real-world judgment. AI can handle these inputs, but its variable output needs containment, validation, and a deterministic state boundary.',
    keyPoints: [
      'Deterministic code remains the correct tool for state and fixed calculations.',
      'Non-deterministic blocks isolate AI and web operations.',
      'Consensus selects an acceptable result before state changes.',
    ],
    guidance: [
      'Keep the non-deterministic block as small as possible.',
      'Return a simple normalized value from the block.',
      'Perform storage writes after the block returns.',
    ],
    limits: [
      'Do not add AI to a task that fixed code can solve correctly.',
      'Variable dependencies reduce repeatability and can reduce availability.',
    ],
    siteNexisLinks: [
      sitenexis('why-seo-becoming-ai-visibility-engineering', 'The Operating System for AI Visibility'),
      sitenexis('ai-perception-graph-how-machines-see-your-website', 'The AI Perception Graph'),
    ],
    sources: [genlayer.nondeterminism, genlayer.llms],
  },
  {
    slug: 'ai-consensus-in-web3',
    title: 'AI Consensus as a New Layer in Web3',
    description: 'Understand how validators can reach agreement on variable AI and web results.',
    pillar: 'AI and Blockchain',
    publishedAt: '2026-07-25',
    answer: 'AI consensus is a process for agreement about a variable result. GenLayer uses Optimistic Democracy, independent validator assessment, and appeals. The result becomes final after the finality process.',
    keyPoints: [
      'The network selects a leader for each transaction.',
      'A validator group assesses the leader result.',
      'A disputed result can enter a larger appeal round.',
    ],
    guidance: [
      'Select a comparison method that matches the output type.',
      'Explain when a result is accepted and when it is finalized.',
      'Test disagreement and appeal conditions.',
    ],
    limits: [
      'Consensus measures agreement, not absolute truth.',
      'Poor criteria can produce consistent but unsuitable results.',
    ],
    siteNexisLinks: [
      sitenexis('machine-trust-score-how-ai-forms-confidence-in-your-domain', 'Machine Trust Score'),
      sitenexis('temporal-authority-update-frequency-ai-trust-signal', 'Temporal Authority and Trust Decay'),
    ],
    sources: [genlayer.consensus, genlayer.democracy],
  },
  {
    slug: 'ai-applications-humans-can-trust',
    title: 'How to Build AI Applications That Humans Can Trust',
    description: 'Use clear scope, visible states, evidence, and challenge paths to support human trust.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'Human trust requires more than an accurate result. A user must know the decision scope, evidence state, validation method, and available response to an error.',
    keyPoints: [
      'Show whether data is complete, partial, or unavailable.',
      'Separate a model estimate from a verified fact.',
      'Give users a way to inspect or challenge important decisions.',
    ],
    guidance: [
      'Use plain labels for provisional and final transaction states.',
      'Keep an audit record of source and validation events.',
      'Test the interface with failed and disputed decisions.',
    ],
    limits: [
      'Transparency does not remove harmful model behavior.',
      'More information can confuse users when the interface has no clear hierarchy.',
    ],
    siteNexisLinks: [
      sitenexis('synthetic-entity-detection-identifying-manufactured-authority', 'Synthetic Entity Detection'),
      sitenexis('temporal-authority-content-freshness-ai-seo', 'Temporal Authority'),
    ],
    sources: [genlayer.democracy, genlayer.nondeterminism],
  },
  {
    slug: 'rag-in-intelligent-contracts',
    title: 'How Intelligent Contracts Use Retrieval-Augmented Generation',
    description: 'Learn how retrieved web data can support an AI decision and how validators can assess the result.',
    pillar: 'Developer Guides',
    publishedAt: '2026-07-25',
    answer: 'A contract can retrieve external content and give relevant evidence to a language model. The contract must contain retrieval and model calls in a non-deterministic block and validate the returned result.',
    keyPoints: [
      'Retrieval grounds the model task in selected external information.',
      'Different validators can receive different source versions.',
      'Stable fields and normalized output make validation easier.',
    ],
    guidance: [
      'Select sources before you write the prompt.',
      'Limit source text to information that is necessary for the decision.',
      'Return structured output with source identifiers.',
    ],
    limits: [
      'Retrieval does not guarantee that a source is correct.',
      'A changing page can produce different evidence during one validation round.',
    ],
    siteNexisLinks: [
      sitenexis('rag-seo-retrieval-augmented-generation-content-strategy', 'RAG and SEO'),
      sitenexis('retrieval-simulation-six-stages-where-ai-drops-your-content', 'Retrieval Simulation'),
    ],
    sources: [genlayer.web, genlayer.llms],
  },
  {
    slug: 'from-smart-contracts-to-intelligent-contracts',
    title: 'The Change from Smart Contracts to Intelligent Contracts',
    description: 'Review the technical change from fixed on-chain rules to validated decisions that use language and web data.',
    pillar: 'Intelligent Contracts',
    publishedAt: '2026-07-25',
    answer: 'Intelligent Contracts extend the contract model. They keep deterministic state but add controlled operations for language models and web data. Validators use defined criteria to assess variable output.',
    keyPoints: [
      'Python gives developers a familiar contract language.',
      'Non-deterministic operations run in restricted blocks.',
      'The Equivalence Principle defines acceptable agreement.',
    ],
    guidance: [
      'Identify which requirement cannot use fixed code.',
      'Design the validation rule before the model prompt.',
      'Keep the final state change deterministic.',
    ],
    limits: [
      'The new model adds external dependencies and latency.',
      'Developers must test meaning and evidence, not only code paths.',
    ],
    siteNexisLinks: [
      sitenexis('introducing-ai-visibility-metric-replacing-seo-rankings', 'The End of Rankings as the Primary Visibility Metric'),
      sitenexis('why-ai-visibility-bigger-than-seo-aeo-geo', 'The AI Visibility Score'),
    ],
    sources: [genlayer.introduction, genlayer.nondeterminism],
  },
  {
    slug: 'can-llms-become-validators',
    title: 'Can Large Language Models Become Validators?',
    description: 'Distinguish between a validator node, an AI model, and the validation rule that connects them.',
    pillar: 'AI and Blockchain',
    publishedAt: '2026-07-25',
    answer: 'A language model is not the complete validator. A validator runs network software, executes contract tasks, uses an AI model when necessary, and submits a vote under protocol rules.',
    keyPoints: [
      'The validator node has protocol and execution responsibilities.',
      'The model supplies reasoning for defined tasks.',
      'Stake, selection, voting, and appeals belong to the network protocol.',
    ],
    guidance: [
      'Do not describe a model response as a validator vote.',
      'Define the model interface and error behavior.',
      'Use diverse execution paths where correlated failure is a concern.',
    ],
    limits: [
      'Model diversity does not guarantee independent reasoning.',
      'A model provider can become an external operational dependency.',
    ],
    siteNexisLinks: [
      sitenexis('tool-calling-citations-ai-agents', 'Tool Calling, Citations, and Source Trust'),
      sitenexis('how-autonomous-ai-agents-discover-websites', 'How Autonomous AI Agents Discover Websites'),
    ],
    sources: [genlayer.consensus, genlayer.llms],
  },
  {
    slug: 'ai-memory-and-blockchain',
    title: 'How AI Memory Can Change Blockchain Applications',
    description: 'Compare temporary model context with persistent and verifiable contract state.',
    pillar: 'The Intelligent Internet',
    publishedAt: '2026-07-25',
    answer: 'A model context is temporary. Contract state is persistent and shared. An application can use contract state as a controlled memory layer for facts, permissions, and prior decisions.',
    keyPoints: [
      'Persistent state can give later AI tasks a common reference.',
      'On-chain state makes changes visible and ordered.',
      'The contract must control what information enters memory.',
    ],
    guidance: [
      'Store compact facts instead of full private conversations.',
      'Add source and version information to important memory records.',
      'Define rules for correction, expiry, and conflict.',
    ],
    limits: [
      'Persistent storage can preserve an error for a long time.',
      'Public state is not suitable for confidential memory.',
    ],
    siteNexisLinks: [
      sitenexis('llm-memory-and-brand-presence-what-every-marketer-needs-to-know', 'LLM Memory and Brand Presence'),
      sitenexis('building-knowledge-graph-ai-visibility', 'Building a Knowledge Graph for AI Visibility'),
    ],
    sources: [genlayer.introduction, genlayer.nondeterminism],
  },
  {
    slug: 'ai-native-dapps-for-agentic-web',
    title: 'How to Design AI-Native Applications for the Agentic Web',
    description: 'Design contract interfaces that humans and software agents can inspect and use safely.',
    pillar: 'The Intelligent Internet',
    publishedAt: '2026-07-25',
    answer: 'An agent-ready application needs clear methods, structured results, explicit error states, stable identifiers, and verifiable permissions. A visual interface alone is not sufficient.',
    keyPoints: [
      'Agents need machine-readable method and parameter descriptions.',
      'Structured output reduces ambiguous interpretation.',
      'Contract state can provide a shared source of execution truth.',
    ],
    guidance: [
      'Use stable names for methods, fields, networks, and states.',
      'Return a clear failure state instead of an empty successful result.',
      'Separate read operations from state-changing operations.',
    ],
    limits: [
      'Machine-readable access can increase automated abuse risk.',
      'An agent still needs authorization and transaction limits.',
    ],
    siteNexisLinks: [
      sitenexis('building-for-the-agentic-web', 'Building for the Agentic Web'),
      sitenexis('model-context-protocol-and-what-it-means-for-web-discovery', 'Model Context Protocol and Web Discovery'),
    ],
    sources: [genlayer.introduction, genlayer.web],
  },
  {
    slug: 'decentralised-ai-governance',
    title: 'How to Implement Decentralised AI Governance',
    description: 'Use explicit proposals, validation rules, appeals, and finality for AI-assisted governance decisions.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'Decentralised AI governance must define who proposes, who validates, how disagreement works, and when a decision becomes final. AI can assess evidence, but protocol rules control authority.',
    keyPoints: [
      'A proposal must identify its decision scope and evidence.',
      'Validators need a clear acceptance rule.',
      'An appeal process provides a controlled response to disagreement.',
    ],
    guidance: [
      'Keep voting authority separate from model output.',
      'Return complete, partial, and unavailable evidence states.',
      'Set a finality rule before the governance process starts.',
    ],
    limits: [
      'Decentralisation does not remove voter or validator incentives.',
      'An AI summary can omit evidence that a voter considers important.',
    ],
    siteNexisLinks: [
      sitenexis('graceful-truth-layer-api-design', 'The Graceful Truth Layer'),
      sitenexis('gtl-state-envelopes-complete-partial-empty', 'State Envelopes'),
    ],
    sources: [genlayer.democracy, genlayer.consensus],
  },
  {
    slug: 'verifiable-ai-decision-engines',
    title: 'The Growth of Verifiable AI Decision Engines',
    description: 'See how a decision engine can connect evidence, model reasoning, validator assessment, and deterministic action.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'A verifiable AI decision engine does not return an unsupported model answer. It connects the answer to evidence, a validation rule, independent assessment, and a recorded state change.',
    keyPoints: [
      'Evidence defines the factual input to the decision.',
      'A model produces or assesses a proposal.',
      'Consensus controls whether the proposal can affect state.',
    ],
    guidance: [
      'Give each decision a stable identifier.',
      'Store the validation result separately from the model explanation.',
      'Make failed evidence retrieval an explicit state.',
    ],
    limits: [
      'A recorded decision can still use incomplete evidence.',
      'Verification adds operational cost and response time.',
    ],
    siteNexisLinks: [
      sitenexis('decision-intelligence-layer-from-scores-to-roadmap', 'Decision Intelligence Layer'),
      sitenexis('outcome-intelligence-audit-scores-to-market-position', 'Outcome Intelligence'),
    ],
    sources: [genlayer.nondeterminism, genlayer.consensus],
  },
  {
    slug: 'explainable-ai-and-accurate-ai',
    title: 'Why Explainable AI Is as Important as Accurate AI',
    description: 'Understand why accuracy measurements and process explanations answer different trust questions.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'Accuracy measures results against a reference. Explainability describes the inputs, rules, state, and limits of a decision. A high accuracy score does not explain one specific result.',
    keyPoints: [
      'Users need the result and the decision state.',
      'Reviewers need the evidence and validation rule.',
      'Developers need error and disagreement records.',
    ],
    guidance: [
      'Report estimates as estimates.',
      'Show when the source set is incomplete.',
      'Describe the validator rule in plain technical language.',
    ],
    limits: [
      'A simple explanation can hide complex model behavior.',
      'An explanation must not claim access to internal model reasoning.',
    ],
    siteNexisLinks: [
      sitenexis('intelligence-report-grok-style-executive-audit-narrative', 'The Intelligence Report'),
      sitenexis('graceful-truth-layer-api-state-envelope', 'Graceful Truth Layer State Envelopes'),
    ],
    sources: [genlayer.llms, genlayer.nondeterminism],
  },
  {
    slug: 'ai-agents-blockchain-next-internet',
    title: 'AI Agents, Blockchain, and the Next Internet',
    description: 'Learn how agents can use contracts for permissions, shared state, payment, and verifiable decisions.',
    pillar: 'The Intelligent Internet',
    publishedAt: '2026-07-25',
    answer: 'AI agents can plan and call tools. A blockchain can provide shared state, ownership, and transaction rules. Intelligent Contracts can add validated decisions that use language and web evidence.',
    keyPoints: [
      'Agents need clear tools and bounded permissions.',
      'Contracts provide a common execution and state layer.',
      'Validation can reduce reliance on one model response.',
    ],
    guidance: [
      'Give each agent the minimum transaction authority that it needs.',
      'Require human approval for high-impact actions.',
      'Use structured results that another agent can inspect.',
    ],
    limits: [
      'Autonomy increases the effect of a configuration error.',
      'A public chain does not protect confidential agent context.',
    ],
    siteNexisLinks: [
      sitenexis('how-ai-agents-browse-and-trust-the-web', 'How AI Agents Browse and Trust the Web'),
      sitenexis('building-for-machine-consumers', 'Building for Machine Consumers'),
    ],
    sources: [genlayer.introduction, genlayer.web],
  },
  {
    slug: 'ai-reputation-layer-for-decentralised-web',
    title: 'How to Build an AI Reputation Layer for the Decentralised Web',
    description: 'Design reputation as evidence, time, identity, and decision context instead of one permanent score.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'A useful reputation layer links an entity to verified actions, source evidence, time, and context. One score cannot describe every form of trust.',
    keyPoints: [
      'Identity resolution must occur before reputation scoring.',
      'Recent and old evidence can have different value.',
      'A decision must state which reputation dimensions it uses.',
    ],
    guidance: [
      'Store evidence references with each reputation event.',
      'Separate activity, accuracy, reliability, and authority.',
      'Define correction and expiry rules.',
    ],
    limits: [
      'A reputation score can amplify old errors or coordinated activity.',
      'Public reputation data can create privacy and fairness risks.',
    ],
    siteNexisLinks: [
      sitenexis('machine-trust-score-how-ai-forms-confidence-in-your-domain', 'Machine Trust Score'),
      sitenexis('entity-confidence-score-four-dimensions-ai-trust-in-brand', 'Entity Confidence Score'),
    ],
    sources: [genlayer.democracy, genlayer.consensus],
  },
  {
    slug: 'why-ai-applications-need-knowledge-graphs',
    title: 'Why Every AI Application Needs a Knowledge Graph',
    description: 'Use explicit entities and relationships to reduce ambiguity in AI retrieval and contract decisions.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'A knowledge graph gives an AI application stable entities, relationships, and identifiers. This structure helps the application connect evidence and avoid ambiguous names.',
    keyPoints: [
      'Entity identifiers separate names from identity.',
      'Typed relationships state how two entities are connected.',
      'Source references support verification and updates.',
    ],
    guidance: [
      'Define the main entity types before you collect data.',
      'Attach a source and update time to important facts.',
      'Resolve conflicting claims instead of silently replacing them.',
    ],
    limits: [
      'A graph structure does not guarantee correct facts.',
      'Uncontrolled graph growth can make validation difficult.',
    ],
    siteNexisLinks: [
      sitenexis('building-knowledge-graph-ai-visibility', 'How to Build a Knowledge Graph That AI Systems Trust'),
      sitenexis('ai-perception-graph-semantic-topology', 'The AI Perception Graph'),
    ],
    sources: [genlayer.web, genlayer.nondeterminism],
  },
  {
    slug: 'intelligent-contracts-and-autonomous-commerce',
    title: 'Intelligent Contracts and Autonomous Commerce',
    description: 'See how agents and contracts can support purchases, escrow, service checks, and dispute resolution.',
    pillar: 'Intelligent Contracts',
    publishedAt: '2026-07-25',
    answer: 'Autonomous commerce needs more than automatic payment. It needs product discovery, authority limits, evidence checks, settlement rules, and dispute handling. Intelligent Contracts can coordinate these controls.',
    keyPoints: [
      'An agent can select an action within a defined budget and policy.',
      'A contract can hold state and enforce settlement conditions.',
      'Validated web evidence can support delivery or dispute decisions.',
    ],
    guidance: [
      'Set transaction and time limits for each agent.',
      'Define the evidence that proves delivery or failure.',
      'Require an appeal path for material disputes.',
    ],
    limits: [
      'External commercial data can be unavailable or manipulated.',
      'Consumer protection and legal duties remain applicable.',
    ],
    siteNexisLinks: [
      sitenexis('recommendation-surface-coverage-brand-ai-visibility', 'Recommendation-Based Discovery'),
      sitenexis('building-machine-readable-content-system-from-scratch', 'Building a Machine-Readable Content System'),
    ],
    sources: [genlayer.web, genlayer.democracy],
  },
  {
    slug: 'how-ai-search-discovers-blockchain-applications',
    title: 'How AI Search Systems Discover Blockchain Applications',
    description: 'Make a blockchain application easy for crawlers and AI retrieval systems to identify, understand, and cite.',
    pillar: 'The Intelligent Internet',
    publishedAt: '2026-07-25',
    answer: 'AI search needs crawlable pages, clear entity descriptions, stable URLs, structured metadata, and useful source text. Contract code and a social profile are not sufficient discovery resources.',
    keyPoints: [
      'A public page must explain the application and its network context.',
      'Canonical URLs and sitemaps support consistent discovery.',
      'Machine-readable resources help tools find authoritative information.',
    ],
    guidance: [
      'Publish a clear page for the product, documentation, and each main concept.',
      'Use the same entity name and description across pages.',
      'Link technical claims to primary documentation.',
    ],
    limits: [
      'Metadata does not guarantee indexing or citation.',
      'AI search systems use different retrieval and ranking methods.',
    ],
    siteNexisLinks: [
      sitenexis('how-ai-systems-discover-content-beyond-google', 'How AI Systems Discover New Content'),
      sitenexis('how-chatgpt-perplexity-claude-choose-citations', 'How ChatGPT, Perplexity, and Claude Choose What to Cite'),
    ],
    sources: [genlayer.introduction, genlayer.consensus],
  },
  {
    slug: 'ai-visibility-for-web3',
    title: 'Why Good Web3 Projects Can Have Low AI Visibility',
    description: 'Learn why sound contract code does not automatically make a Web3 project easy for AI systems to retrieve or explain.',
    pillar: 'The Intelligent Internet',
    publishedAt: '2026-07-25',
    answer: 'A project can have good code and weak public explanations. AI retrieval systems need crawlable content, clear entities, direct answers, stable terminology, and trusted references.',
    keyPoints: [
      'Source code proves implementation but may not explain product purpose.',
      'Inconsistent network and product names reduce entity clarity.',
      'Thin documentation gives retrieval systems few useful answer units.',
    ],
    guidance: [
      'Publish direct answers to developer and user questions.',
      'Connect product pages, documentation, contract examples, and public metadata.',
      'Review content after protocol and network changes.',
    ],
    limits: [
      'More content does not guarantee better visibility.',
      'Self-published claims still need external support.',
    ],
    siteNexisLinks: [
      sitenexis('introducing-ai-visibility-metric-replacing-seo-rankings', 'Introducing AI Visibility'),
      sitenexis('why-ai-systems-ignore-70-percent-of-your-content', 'Why AI Systems Ignore Most Website Content'),
    ],
    sources: [genlayer.introduction, genlayer.consensus],
  },
  {
    slug: 'equivalence-principle-validates-ai-output',
    title: 'How the Equivalence Principle Validates AI Output',
    description: 'Choose exact comparison, comparative review, or criteria-based validation for a non-deterministic contract result.',
    pillar: 'Intelligent Contracts',
    publishedAt: '2026-07-25',
    answer: 'The Equivalence Principle lets validators assess results that can differ in wording or form. The developer defines what an acceptable result means for the contract.',
    keyPoints: [
      'Strict equality is suitable for normalized results that must match exactly.',
      'Comparative validation checks whether independently produced results have acceptable agreement.',
      'Non-comparative validation checks a leader result against explicit criteria.',
    ],
    guidance: [
      'Define the accepted output structure before you select a comparison method.',
      'Use objective criteria that a validator can apply without hidden business context.',
      'Test valid disagreement, malformed output, and unavailable model responses.',
    ],
    limits: [
      'Weak criteria can accept a plausible result that does not meet the business requirement.',
      'Exact equality is usually unsuitable for open-ended language model output.',
    ],
    siteNexisLinks: [
      sitenexis('source-grounded-verification-confidence-scoring-every-finding', 'Source-Grounded Verification'),
      sitenexis('machine-trust-score-trust-is-not-visibility', 'Machine Trust Score: Trust Is Not Visibility'),
    ],
    sources: [genlayer.nondeterminism, genlayer.llms],
  },
  {
    slug: 'safe-failure-states-for-intelligent-contracts',
    title: 'How to Design Safe Failure States for Intelligent Contracts',
    description: 'Represent incomplete evidence, unavailable services, rejected output, and validator disagreement without false success.',
    pillar: 'Developer Guides',
    publishedAt: '2026-07-25',
    answer: 'A safe contract does not convert missing evidence into a valid result. It identifies the failure, prevents an unsafe state change, and gives the caller a clear response.',
    keyPoints: [
      'An unavailable source is different from a source that returns a negative result.',
      'Malformed model output must fail validation before it changes state.',
      'Validator disagreement is a protocol outcome that needs an application response.',
    ],
    guidance: [
      'Define separate states for complete, partial, unavailable, and rejected results.',
      'Keep the previous valid state when a new evidence request fails.',
      'Give users a retry or appeal path when the operation can recover.',
    ],
    limits: [
      'A retry can repeat the same provider or source failure.',
      'A detailed public error can disclose information that helps an attacker.',
    ],
    siteNexisLinks: [
      sitenexis('gtl-state-envelopes-complete-partial-empty', 'Complete, Partial, and Empty State Envelopes'),
      sitenexis('gtl-api-honesty-contracts', 'API Honesty Contracts'),
    ],
    sources: [genlayer.nondeterminism, genlayer.llms],
  },
  {
    slug: 'appeals-and-finality-for-ai-decisions',
    title: 'Appeals and Finality for AI-Assisted Decisions',
    description: 'Understand provisional acceptance, challenge periods, larger validator groups, and final transaction state.',
    pillar: 'Trust and Verification',
    publishedAt: '2026-07-25',
    answer: 'GenLayer can accept a result before it is final. During the finality window, a participant can challenge the result. An appeal adds validators and starts another assessment round.',
    keyPoints: [
      'Accepted and finalized are different transaction states.',
      'An appellant provides a bond and requests another assessment.',
      'Each appeal round can use a larger validator group.',
    ],
    guidance: [
      'Show the current transaction state in the application interface.',
      'Do not settle an irreversible external action before finality when an appeal matters.',
      'Document the operational response to an overturned result.',
    ],
    limits: [
      'Appeals add time and economic cost.',
      'A final result can still reflect the limits of available evidence and validation criteria.',
    ],
    siteNexisLinks: [
      sitenexis('decision-intelligence-layer-from-scores-to-roadmap', 'Decision Intelligence Layer'),
      sitenexis('graceful-truth-layer-api-state-envelope', 'Graceful Truth Layer State Envelopes'),
    ],
    sources: [genlayer.democracy, genlayer.consensus],
  },
  {
    slug: 'prompt-injection-in-web-connected-contracts',
    title: 'Prompt Injection Risks in Web-Connected Intelligent Contracts',
    description: 'Reduce the risk that untrusted web text changes the task, output format, or validator decision.',
    pillar: 'Developer Guides',
    publishedAt: '2026-07-25',
    answer: 'Web content is untrusted input. A page can contain instructions that try to redirect a model task. The contract must constrain sources, prompts, output, and validation.',
    keyPoints: [
      'Retrieved text must remain data and must not become a trusted instruction.',
      'Structured output reduces the space for uncontrolled model responses.',
      'Independent validators need criteria that detect task deviation.',
    ],
    guidance: [
      'Separate system instructions from retrieved evidence with clear delimiters.',
      'Allow only the fields and source domains that the decision requires.',
      'Reject output that adds commands, fields, or claims outside the defined schema.',
    ],
    limits: [
      'Prompt filtering cannot identify every adversarial instruction.',
      'Trusted domains can contain compromised or user-generated content.',
    ],
    siteNexisLinks: [
      sitenexis('tool-calling-citations-ai-agents', 'Tool Calling, Citations, and Source Trust'),
      sitenexis('how-ai-agents-browse-and-trust-the-web', 'How AI Agents Browse and Trust the Web'),
    ],
    sources: [genlayer.web, genlayer.llms],
  },
  {
    slug: 'model-diversity-and-correlated-failure',
    title: 'Model Diversity and Correlated Failure in AI Consensus',
    description: 'Examine why several validators can still fail together when they share models, providers, prompts, or evidence.',
    pillar: 'AI and Blockchain',
    publishedAt: '2026-07-25',
    answer: 'A larger validator group does not guarantee independent judgment. Validators can share one provider, model family, prompt pattern, or source. These shared dependencies can create correlated failure.',
    keyPoints: [
      'Model count and model diversity are different properties.',
      'A shared web source can correlate results from otherwise different models.',
      'Provider outages and policy filters can affect several validators together.',
    ],
    guidance: [
      'Map common providers, model families, prompts, and data sources.',
      'Test the decision with different models and deliberately conflicting evidence.',
      'Define a safe result when the validator group cannot reach agreement.',
    ],
    limits: [
      'Model configuration details can be private to a validator.',
      'Diversity can increase output variance and make comparison more difficult.',
    ],
    siteNexisLinks: [
      sitenexis('multi-agent-orchestration-and-content-intelligence', 'Multi-Agent Orchestration'),
      sitenexis('synthetic-entity-detection-identifying-manufactured-authority', 'Synthetic Entity Detection'),
    ],
    sources: [genlayer.consensus, genlayer.democracy],
  },
  {
    slug: 'web-evidence-for-intelligent-contracts',
    title: 'How to Select Web Evidence for Intelligent Contracts',
    description: 'Choose stable sources, normalize retrieved facts, record provenance, and handle conflicting web evidence.',
    pillar: 'Developer Guides',
    publishedAt: '2026-07-25',
    answer: 'Web evidence needs an explicit source policy. The policy must define allowed sources, required fields, update limits, conflict rules, and the response to unavailable data.',
    keyPoints: [
      'A source URL identifies a location but does not prove source quality.',
      'Validators can retrieve different page versions during one transaction.',
      'Normalized facts are easier to compare than full page text.',
    ],
    guidance: [
      'Prefer primary sources with stable fields and clear update times.',
      'Store the source identifier and observation time with the accepted fact.',
      'Define how the contract handles conflicting or stale evidence.',
    ],
    limits: [
      'A primary source can publish an error or change its format.',
      'Web access adds availability, latency, and content manipulation risks.',
    ],
    siteNexisLinks: [
      sitenexis('rag-seo-retrieval-augmented-generation-content-strategy', 'RAG and Content Strategy'),
      sitenexis('retrieval-simulation-how-we-model-ai-chunk-selection', 'Retrieval Simulation and Chunk Selection'),
    ],
    sources: [genlayer.web, genlayer.nondeterminism],
  },
  {
    slug: 'agent-to-agent-dispute-resolution',
    title: 'How Intelligent Contracts Can Resolve Agent-to-Agent Disputes',
    description: 'Define evidence, authority, settlement, appeals, and finality for commercial actions between software agents.',
    pillar: 'The Intelligent Internet',
    publishedAt: '2026-07-25',
    answer: 'Agents can transact automatically, but they can disagree about delivery, quality, or policy. An Intelligent Contract can hold the terms and validate dispute evidence.',
    keyPoints: [
      'The agreement must define the evidence for completion and failure.',
      'Agent authority and spending limits must be verifiable.',
      'Settlement must follow accepted evidence and the required finality state.',
    ],
    guidance: [
      'Give each agreement a stable identifier and explicit parties.',
      'Define the evidence window, validation criteria, and appeal process.',
      'Require human approval for exceptional or high-value settlements.',
    ],
    limits: [
      'A contract cannot enforce obligations that are outside its technical and legal reach.',
      'Automated disputes can expose private commercial evidence if data handling is weak.',
    ],
    siteNexisLinks: [
      sitenexis('building-for-the-agentic-web', 'Building for the Agentic Web'),
      sitenexis('model-context-protocol-and-what-it-means-for-web-discovery', 'Model Context Protocol and Web Discovery'),
    ],
    sources: [genlayer.democracy, genlayer.web],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getContextualSiteNexisLinks(post: BlogPost): BlogLink[] {
  if (!SITENEXIS_ARTICLE_SLUGS.has(post.slug)) return []

  const links = [...post.siteNexisLinks, ...FOUNDATION_SITE_NEXIS_LINKS]
  const seen = new Set<string>()

  return links
    .filter((link) => {
      if (seen.has(link.href)) return false
      seen.add(link.href)
      return true
    })
    .slice(0, 3)
}

export function getBlogExample(slug: string): BlogExample | undefined {
  return BLOG_EXAMPLES[slug]
}

export function getRelatedBlogPosts(post: BlogPost, count = 2): BlogPost[] {
  const samePillar = BLOG_POSTS.filter(
    (candidate) => candidate.pillar === post.pillar && candidate.slug !== post.slug,
  )
  const otherPillars = BLOG_POSTS.filter(
    (candidate) => candidate.pillar !== post.pillar && candidate.slug !== post.slug,
  )

  return [...samePillar, ...otherPillars].slice(0, count)
}
