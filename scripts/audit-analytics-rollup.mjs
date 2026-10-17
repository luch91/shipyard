import { createClient } from '@supabase/supabase-js'

const date = process.argv[2]
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('Usage: node --env-file=.env.local scripts/audit-analytics-rollup.mjs YYYY-MM-DD')
  process.exit(2)
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(2)
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const start = `${date}T00:00:00.000Z`
const endDate = new Date(Date.parse(start) + 86_400_000).toISOString().slice(0, 10)
const end = `${endDate}T00:00:00.000Z`

const events = []
for (let from = 0; ; from += 1_000) {
  const { data, error } = await db
    .from('analytics_events')
    .select('id, event_name, wallet_hash, network, template_id, metadata, created_at')
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .range(from, from + 999)
  if (error) throw error
  events.push(...data)
  if (data.length < 1_000) break
}

const wallets = new Set()
const deploysByNetwork = {}
const templateCounts = {}
let deploysTotal = 0
let aiGenerations = 0
let forksTotal = 0
let registryViews = 0
let sdkCalls = 0

for (const event of events) {
  if (event.wallet_hash) wallets.add(event.wallet_hash)
  switch (event.event_name) {
    case 'deployment_succeeded':
      deploysTotal += 1
      if (event.network) {
        deploysByNetwork[event.network] = (deploysByNetwork[event.network] ?? 0) + 1
      }
      break
    case 'template_selected': {
      const template = event.template_id ??
        (typeof event.metadata?.template_name === 'string' ? event.metadata.template_name : 'unknown')
      templateCounts[template] = (templateCounts[template] ?? 0) + 1
      break
    }
    case 'contract_loaded':
      if (event.metadata?.method === 'generate') aiGenerations += 1
      break
    case 'contract_forked':
      forksTotal += 1
      break
    case 'registry_viewed':
      registryViews += 1
      break
    case 'sdk_call':
      sdkCalls += 1
      break
  }
}

const expected = {
  date,
  active_wallets: wallets.size,
  deploys_total: deploysTotal,
  deploys_by_network: deploysByNetwork,
  top_templates: Object.entries(templateCounts)
    .map(([template_id, count]) => ({ template_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10),
  ai_generations: aiGenerations,
  ai_success_rate: null,
  forks_total: forksTotal,
  registry_views: registryViews,
  sdk_calls: sdkCalls,
}

const { data: stored, error: storedError } = await db
  .from('analytics_daily_rollups')
  .select('*')
  .eq('date', date)
if (storedError) throw storedError

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
    )
  }
  return value
}
const matches = stored.length === 1 &&
  JSON.stringify(canonicalize(stored[0])) === JSON.stringify(canonicalize(expected))

console.log(JSON.stringify({
  date,
  events_processed: events.length,
  stored_rows: stored.length,
  matches: stored.length === 1 ? matches : null,
  expected,
  stored: stored.length === 1 ? stored[0] : null,
}))
