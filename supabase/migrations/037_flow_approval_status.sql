-- Migration 037: simple Flow approval and official status

ALTER TABLE flows
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'not_requested'
    CHECK (approval_status IN ('not_requested', 'approval_requested', 'adjustments_requested', 'approved')),
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_official boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS official_invalidated_at timestamptz,
  ADD COLUMN IF NOT EXISTS official_invalidated_reason text,
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_responsible_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'user'
    CHECK (source_type IN ('user', 'external_llm', 'redrise_support', 'system')),
  ADD COLUMN IF NOT EXISTS source_label text;

UPDATE flows
SET created_by_user_id = user_id
WHERE created_by_user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_flows_approval_status
  ON flows(user_id, approval_status, is_official);

CREATE INDEX IF NOT EXISTS idx_flows_official_invalidated
  ON flows(user_id, official_invalidated_at)
  WHERE official_invalidated_at IS NOT NULL;
