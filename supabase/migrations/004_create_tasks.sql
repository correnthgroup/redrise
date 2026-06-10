-- Create tasks table

create table tasks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workspace_id text references workspaces(id) on delete set null,
  title text not null default 'New Task',
  brief text not null default '',
  status text not null default 'backlog' check (status in ('backlog', 'in-progress', 'in-review', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table tasks enable row level security;

-- Policy: users can only read their own tasks
create policy "Users can read own tasks"
  on tasks for select
  using (auth.uid() = user_id);

-- Policy: users can insert their own tasks
create policy "Users can insert own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

-- Policy: users can update their own tasks
create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id);

-- Policy: users can delete their own tasks
create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_workspace_id_idx on tasks(workspace_id);
create index if not exists tasks_status_idx on tasks(status);
