-- Check if user has agents
SELECT id, user_id, name, status FROM agents WHERE user_id = (SELECT id FROM auth.users WHERE email = 'raulveiga137@gmail.com');

-- If no agents, create one
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'raulveiga137@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO agents (id, user_id, name, brief, status, model, provider)
    VALUES (
      'a' || substr(md5(random()::text), 1, 5),
      target_user_id,
      'Redrise Default Agent',
      'Your AI assistant for automation purposes, powered by OpenAI followed by OpenRouter integration and configured by Redrise team as well.',
      'idle',
      'openai/gpt-oss-120b:free',
      'openrouter'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Verify
SELECT id, user_id, name, status, model FROM agents WHERE user_id = (SELECT id FROM auth.users WHERE email = 'raulveiga137@gmail.com');
