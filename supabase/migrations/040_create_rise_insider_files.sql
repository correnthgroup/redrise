-- Migration 040: persistent Rise Insider filesystem sandbox

CREATE TABLE IF NOT EXISTS rise_insider_files (
  owner_key text NOT NULL,
  path text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_key, path)
);

ALTER TABLE rise_insider_files ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rise_insider_files_owner_updated
  ON rise_insider_files(owner_key, updated_at DESC);
