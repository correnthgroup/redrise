-- Migration 022: first-class teams with multi-team member assignments.

CREATE TABLE IF NOT EXISTS public.teams (
  id text PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teams_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_owner_name_unique
  ON public.teams(owner_user_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_teams_owner_user_id
  ON public.teams(owner_user_id);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage teams" ON public.teams;
CREATE POLICY "Owners can manage teams"
  ON public.teams FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE TABLE IF NOT EXISTS public.team_assignments (
  id text PRIMARY KEY,
  team_id text NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  function text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_assignments_unique_member
  ON public.team_assignments(team_id, team_member_id);

CREATE INDEX IF NOT EXISTS idx_team_assignments_team_id
  ON public.team_assignments(team_id);

CREATE INDEX IF NOT EXISTS idx_team_assignments_team_member_id
  ON public.team_assignments(team_member_id);

ALTER TABLE public.team_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage team assignments" ON public.team_assignments;
CREATE POLICY "Owners can manage team assignments"
  ON public.team_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_assignments.team_id
        AND teams.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_assignments.team_id
        AND teams.owner_user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.enforce_team_limit()
RETURNS trigger AS $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.teams
    WHERE owner_user_id = NEW.owner_user_id
  ) >= 7 THEN
    RAISE EXCEPTION 'Team limit reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_team_limit_before_insert ON public.teams;
CREATE TRIGGER enforce_team_limit_before_insert
  BEFORE INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.enforce_team_limit();

DROP TRIGGER IF EXISTS touch_teams_updated_at ON public.teams;
CREATE TRIGGER touch_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_team_assignments_updated_at ON public.team_assignments;
CREATE TRIGGER touch_team_assignments_updated_at
  BEFORE UPDATE ON public.team_assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
