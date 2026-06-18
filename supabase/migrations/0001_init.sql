-- Shipyard — initial schema (PRD §8)
-- RLS is enabled on every table. There are intentionally NO permissive policies:
-- all access goes through server-side Route Handlers using the service-role key
-- (which bypasses RLS). This is a secure deny-by-default for any anon/client access.
-- Add narrowly-scoped policies later if/when direct client reads are introduced.

-- ── contracts ────────────────────────────────────────────────────────────────
create table if not exists contracts (
  id              uuid primary key default gen_random_uuid(),
  address         text not null,
  network         text not null,
  source          text,
  abi             jsonb,
  is_verified     boolean not null default false,
  deployer_wallet text,
  template_id     text,
  deploy_tx       text,
  deployed_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (address, network)
);
create index if not exists contracts_network_idx        on contracts (network);
create index if not exists contracts_deployer_idx        on contracts (deployer_wallet);
create index if not exists contracts_template_idx        on contracts (template_id);

-- ── builder_profiles ─────────────────────────────────────────────────────────
create table if not exists builder_profiles (
  wallet_address      text primary key,
  display_name        text,
  contracts_deployed  integer not null default 0,
  contracts_verified  integer not null default 0,
  forks_received      integer not null default 0,
  forks_made          integer not null default 0,
  reputation_score    integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── workspaces ───────────────────────────────────────────────────────────────
create table if not exists workspaces (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  owner_wallet        text not null,
  plan                text not null default 'free',
  stripe_customer_id  text,
  subscription_status text,
  is_private          boolean not null default false,
  created_at          timestamptz not null default now()
);
create index if not exists workspaces_owner_idx on workspaces (owner_wallet);

-- ── workspace_members ────────────────────────────────────────────────────────
create table if not exists workspace_members (
  workspace_id   uuid not null references workspaces (id) on delete cascade,
  wallet_address text not null,
  role           text not null,
  invited_by     text,
  joined_at      timestamptz not null default now(),
  primary key (workspace_id, wallet_address)
);

-- ── contract_versions ────────────────────────────────────────────────────────
create table if not exists contract_versions (
  id               uuid primary key default gen_random_uuid(),
  contract_address text not null,
  base_address     text,
  version_number   integer,
  network          text not null,
  source           text,
  deploy_tx        text,
  deployed_by      text,
  deployed_at      timestamptz
);
create index if not exists contract_versions_base_idx on contract_versions (base_address);

-- ── collections ──────────────────────────────────────────────────────────────
create table if not exists collections (
  id             uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  name           text not null,
  created_at     timestamptz not null default now()
);
create index if not exists collections_wallet_idx on collections (wallet_address);

-- ── collection_items ─────────────────────────────────────────────────────────
create table if not exists collection_items (
  collection_id    uuid not null references collections (id) on delete cascade,
  contract_address text not null,
  network          text not null,
  added_at         timestamptz not null default now(),
  primary key (collection_id, contract_address, network)
);

-- ── contract_activity ────────────────────────────────────────────────────────
create table if not exists contract_activity (
  id               uuid primary key default gen_random_uuid(),
  contract_address text not null,
  network          text not null,
  method_name      text,
  caller_address   text,
  tx_hash          text,
  success          boolean,
  called_at        timestamptz
);
create index if not exists contract_activity_contract_idx on contract_activity (contract_address);

-- ── analytics_events ─────────────────────────────────────────────────────────
create table if not exists analytics_events (
  id               uuid primary key default gen_random_uuid(),
  event_name       text not null,
  wallet_hash      text,
  session_id       uuid,
  network          text,
  template_id      text,
  contract_address text,
  metadata         jsonb,
  user_agent       text,
  created_at       timestamptz not null default now()
);
create index if not exists analytics_events_name_idx    on analytics_events (event_name);
create index if not exists analytics_events_created_idx on analytics_events (created_at);

-- ── analytics_daily_rollups ──────────────────────────────────────────────────
create table if not exists analytics_daily_rollups (
  date              date primary key,
  active_wallets    integer,
  deploys_total     integer,
  deploys_by_network jsonb,
  top_templates     jsonb,
  ai_generations    integer,
  ai_success_rate   numeric(5,2),
  forks_total       integer,
  registry_views    integer,
  sdk_calls         integer
);

-- ── Row Level Security: enabled everywhere, deny-by-default ───────────────────
alter table contracts              enable row level security;
alter table builder_profiles       enable row level security;
alter table workspaces             enable row level security;
alter table workspace_members      enable row level security;
alter table contract_versions      enable row level security;
alter table collections            enable row level security;
alter table collection_items       enable row level security;
alter table contract_activity      enable row level security;
alter table analytics_events       enable row level security;
alter table analytics_daily_rollups enable row level security;
