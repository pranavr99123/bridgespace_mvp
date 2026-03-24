create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  invite_code text unique not null,
  partner_a_id uuid references auth.users,
  partner_b_id uuid references auth.users,
  paired_at timestamptz,
  portrait_state jsonb default '{}'::jsonb,
  signal_model jsonb default '{}'::jsonb,
  status text default 'active'
);

create table if not exists profiles (
  id uuid primary key references auth.users,
  created_at timestamptz default now(),
  couple_id uuid references couples,
  display_name text not null default 'Partner',
  partner_role text,
  intake_data jsonb default '{}'::jsonb
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  completed_at timestamptz,
  couple_id uuid references couples not null,
  mode text not null,
  status text default 'pending',
  prompt_data jsonb not null default '{}'::jsonb,
  response_a jsonb,
  response_b jsonb,
  revealed_at timestamptz,
  ai_feedback jsonb,
  vault_summary text,
  signal_notes jsonb
);

create table if not exists signal_observations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  couple_id uuid references couples not null,
  observation text not null,
  category text not null,
  confidence float,
  session_ids uuid[],
  dismissed boolean default false,
  edited_text text
);

create table if not exists vault_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions unique,
  couple_id uuid references couples not null,
  created_at timestamptz default now(),
  mode text,
  title text,
  summary text,
  tags text[],
  is_milestone boolean default false,
  highlight text
);
