SELECT id, user_id, name, status FROM agents WHERE user_id = (SELECT id FROM auth.users WHERE email = 'raulveiga137@gmail.com');
