-- Create flow_cards and flow_edges tables

-- Cards (nodes in React Flow)
create table flow_cards (
  id text primary key,
  flow_id text references flows(id) on delete cascade not null,
  node_id text not null,
  label text not null default 'New Card',
  instructions text not null default '',
  members jsonb not null default '[]'::jsonb,
  agents jsonb not null default '[]'::jsonb,
  position_x real not null default 0,
  position_y real not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Edges (connections in React Flow)
create table flow_edges (
  id text primary key,
  flow_id text references flows(id) on delete cascade not null,
  edge_id text not null,
  source text not null,
  target text not null,
  animated boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table flow_cards enable row level security;
alter table flow_edges enable row level security;

-- Policies for flow_cards
create policy "Users can read own flow_cards"
  on flow_cards for select
  using (auth.uid() = (select user_id from flows where id = flow_id));

create policy "Users can insert own flow_cards"
  on flow_cards for insert
  with check (auth.uid() = (select user_id from flows where id = flow_id));

create policy "Users can update own flow_cards"
  on flow_cards for update
  using (auth.uid() = (select user_id from flows where id = flow_id));

create policy "Users can delete own flow_cards"
  on flow_cards for delete
  using (auth.uid() = (select user_id from flows where id = flow_id));

-- Policies for flow_edges
create policy "Users can read own flow_edges"
  on flow_edges for select
  using (auth.uid() = (select user_id from flows where id = flow_id));

create policy "Users can insert own flow_edges"
  on flow_edges for insert
  with check (auth.uid() = (select user_id from flows where id = flow_id));

create policy "Users can update own flow_edges"
  on flow_edges for update
  using (auth.uid() = (select user_id from flows where id = flow_id));

create policy "Users can delete own flow_edges"
  on flow_edges for delete
  using (auth.uid() = (select user_id from flows where id = flow_id));

-- Indexes
create index if not exists flow_cards_flow_id_idx on flow_cards(flow_id);
create index if not exists flow_edges_flow_id_idx on flow_edges(flow_id);
