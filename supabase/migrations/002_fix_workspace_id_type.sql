-- Fix: change id column from uuid to text to support short IDs like 'w3k7m'

-- Drop the old table and recreate with text id
-- WARNING: this deletes all existing workspace data
drop policy if exists "Users can read own workspaces" on workspaces;
drop policy if exists "Users can insert own workspaces" on workspaces;
drop policy if exists "Users can update own workspaces" on workspaces;
drop policy if exists "Users can delete own workspaces" on workspaces;
drop table if exists workspaces;

create table workspaces (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'New Workspace',
  mission text not null default '',
  status text not null default 'pending' check (status in ('healthy', 'maintenance', 'pending')),
  flows integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table workspaces enable row level security;

-- Policy: users can only read their own workspaces
create policy "Users can read own workspaces"
  on workspaces for select
  using (auth.uid() = user_id);

-- Policy: users can insert their own workspaces
create policy "Users can insert own workspaces"
  on workspaces for insert
  with check (auth.uid() = user_id);

-- Policy: users can update their own workspaces
create policy "Users can update own workspaces"
  on workspaces for update
  using (auth.uid() = user_id);

-- Policy: users can delete their own workspaces
create policy "Users can delete own workspaces"
  on workspaces for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists workspaces_user_id_idx on workspaces(user_id);
