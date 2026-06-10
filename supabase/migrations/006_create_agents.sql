-- Migration 006: Create agents table with default agent
-- Stores AI agents with OpenRouter configuration

CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brief TEXT DEFAULT '',
  status TEXT DEFAULT 'idle' CHECK (status IN ('active', 'paused', 'error', 'idle')),
  model TEXT DEFAULT 'openai/gpt-oss-120b:free',
  provider TEXT DEFAULT 'openrouter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policies (4 per table pattern)
CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_agents_user_id ON agents(user_id);

-- Insert default agent for all users (will be cloned per user on first login)
-- This is a template; the actual default agent is created via the app
INSERT INTO agents (id, user_id, name, brief, status, model, provider) VALUES
  ('a0001', '00000000-0000-0000-0000-000000000000', 'Default Agent', 'General purpose AI assistant with OpenRouter integration.', 'idle', 'openai/gpt-oss-120b:free', 'openrouter')
ON CONFLICT (id) DO NOTHING;
