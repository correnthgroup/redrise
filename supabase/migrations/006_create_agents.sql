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

-- Function to create default agent for a user
CREATE OR REPLACE FUNCTION create_default_agent_for_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO agents (id, user_id, name, brief, status, model, provider)
  VALUES (
    'a' || substr(md5(random()::text), 1, 5),
    target_user_id,
    'Default Agent',
    'General purpose AI assistant with OpenRouter integration.',
    'idle',
    'openai/gpt-oss-120b:free',
    'openrouter'
  )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: create default agent when new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_agent_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create default agents for ALL existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    INSERT INTO agents (id, user_id, name, brief, status, model, provider)
    VALUES (
      'a' || substr(md5(random()::text), 1, 5),
      user_record.id,
      'Default Agent',
      'General purpose AI assistant with OpenRouter integration.',
      'idle',
      'openai/gpt-oss-120b:free',
      'openrouter'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
