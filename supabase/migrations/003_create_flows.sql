-- Create flows table

create table flows (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workspace_id text references workspaces(id) on delete cascade not null,
  name text not null default 'New Flow',
  status text not null default 'paused' check (status in ('running', 'paused', 'error')),
  members jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table flows enable row level security;

-- Policy: users can only read their own flows
create policy "Users can read own flows"
  on flows for select
  using (auth.uid() = user_id);

-- Policy: users can insert their own flows
create policy "Users can insert own flows"
  on flows for insert
  with check (auth.uid() = user_id);

-- Policy: users can update their own flows
create policy "Users can update own flows"
  on flows for update
  using (auth.uid() = user_id);

-- Policy: users can delete their own flows
create policy "Users can delete own flows"
  on flows for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists flows_user_id_idx on flows(user_id);
create index if not exists flows_workspace_id_idx on flows(workspace_id);
