-- Fonction RPC pour tester l'authentification
CREATE OR REPLACE FUNCTION test_auth_uid()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'role', current_setting('request.jwt.claims', true)::json->>'role'
  );
$$;