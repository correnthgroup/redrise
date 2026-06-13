-- Migration 018: harden legacy auth user trigger with explicit public schema references

CREATE OR REPLACE FUNCTION public.create_default_agent_for_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.agents (id, user_id, name, brief, status, model, provider)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_default_agent_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
