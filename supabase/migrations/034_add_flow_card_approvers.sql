-- Migration 034: Add approvers column to flow_cards
-- Stores which team members approve tasks linked to this card.

ALTER TABLE flow_cards
  ADD COLUMN IF NOT EXISTS approvers jsonb NOT NULL DEFAULT '[]'::jsonb;
