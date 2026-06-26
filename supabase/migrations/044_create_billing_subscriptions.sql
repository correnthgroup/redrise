-- Migration 044: real billing subscription state

CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  owner_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'business', 'corporate')),
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'checkout_pending', 'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  stripe_checkout_session_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Role scoped users can view billing subscriptions" ON public.billing_subscriptions;
CREATE POLICY "Role scoped users can view billing subscriptions"
  ON public.billing_subscriptions FOR SELECT
  USING (public.can_view_user_scoped_data(owner_user_id));

DROP POLICY IF EXISTS "Role scoped users can insert billing subscriptions" ON public.billing_subscriptions;
CREATE POLICY "Role scoped users can insert billing subscriptions"
  ON public.billing_subscriptions FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(owner_user_id));

DROP POLICY IF EXISTS "Role scoped users can update billing subscriptions" ON public.billing_subscriptions;
CREATE POLICY "Role scoped users can update billing subscriptions"
  ON public.billing_subscriptions FOR UPDATE
  USING (public.can_manage_user_scoped_data(owner_user_id))
  WITH CHECK (public.can_manage_user_scoped_data(owner_user_id));

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_customer ON public.billing_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON public.billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_updated_at ON public.billing_subscriptions(updated_at DESC);

CREATE OR REPLACE FUNCTION public.touch_billing_subscription_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_billing_subscriptions_updated_at ON public.billing_subscriptions;
CREATE TRIGGER trg_billing_subscriptions_updated_at
BEFORE UPDATE ON public.billing_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.touch_billing_subscription_updated_at();
