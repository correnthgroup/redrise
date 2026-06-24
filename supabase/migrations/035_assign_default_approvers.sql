-- Migration 035: Assign default approver to existing flow cards
-- Problem: Migration 034 added `approvers` column with DEFAULT '[]', but
-- the save validation requires non-empty approvers. This blocks saving
-- any modifications to pre-migration flows.
-- Solution: Assign the flow owner as default approver to all cards with empty approvers.

-- Assign flow owner as approver to all cards with empty approvers array
UPDATE flow_cards fc
SET approvers = json_build_array(f.user_id::text)::jsonb
FROM flows f
WHERE f.id = fc.flow_id
  AND (fc.approvers = '[]'::jsonb OR fc.approvers IS NULL);

-- Verify: count updated cards
DO $$
DECLARE
  updated_count integer;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM flow_cards
  WHERE approvers != '[]'::jsonb
    AND approvers IS NOT NULL;
  RAISE NOTICE 'Migration 035: Assigned default approver to % flow cards', updated_count;
END $$;
