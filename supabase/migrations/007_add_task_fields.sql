-- Migration 007: Add new fields to tasks table
-- Adds objective, prompt, documents, team_members, agent_id

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS objective TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS prompt TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS agent_id TEXT DEFAULT NULL;
