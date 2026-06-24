-- Migration 033: Add flow_card_id and queue_position to tasks
-- Links a task to a specific flow card and orders it within that card's queue.

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS flow_card_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS queue_position integer DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_flow_card_id ON tasks(flow_card_id)
  WHERE flow_card_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_card_queue ON tasks(flow_card_id, queue_position)
  WHERE flow_card_id IS NOT NULL;
