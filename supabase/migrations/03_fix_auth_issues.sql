-- This migration fixes session logout issues and ensures proper session cleanup

-- 1. Create a function to handle session invalidation on logout
CREATE OR REPLACE FUNCTION public.handle_session_logout()
RETURNS TRIGGER AS $$
BEGIN
  -- Immediately invalidate all refresh tokens for this session
  UPDATE auth.refresh_tokens
  SET revoked = true
  WHERE session_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create session logout trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_session_delete ON auth.sessions;
CREATE TRIGGER on_session_delete
  AFTER DELETE ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_session_logout();

-- 2. Function to force logout a user by email (for admin use)
CREATE OR REPLACE FUNCTION public.force_logout_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  sessions_removed INT := 0;
  tokens_revoked INT := 0;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User not found';
  END IF;
  
  -- Revoke all refresh tokens
  WITH updated AS (
    UPDATE auth.refresh_tokens rt
    SET revoked = true
    FROM auth.sessions s
    WHERE rt.session_id = s.id
    AND s.user_id = user_id
    AND rt.revoked = false
    RETURNING rt.id
  )
  SELECT COUNT(*) INTO tokens_revoked FROM updated;
  
  -- Delete all sessions
  WITH deleted AS (
    DELETE FROM auth.sessions
    WHERE user_id = user_id
    RETURNING id
  )
  SELECT COUNT(*) INTO sessions_removed FROM deleted;
  
  RETURN format('Successfully removed %s sessions and revoked %s tokens for user %s', 
    sessions_removed, tokens_revoked, user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a function to clean up expired sessions (to be run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS TABLE(sessions_removed BIGINT, tokens_revoked BIGINT) AS $$
DECLARE
  _sessions_removed BIGINT;
  _tokens_revoked BIGINT;
BEGIN
  -- First revoke expired tokens
  WITH revoked_tokens AS (
    UPDATE auth.refresh_tokens
    SET revoked = true
    WHERE expires_at < now()
    AND revoked = false
    RETURNING id
  )
  SELECT COUNT(*) INTO _tokens_revoked FROM revoked_tokens;
  
  -- Then delete expired sessions
  WITH deleted_sessions AS (
    DELETE FROM auth.sessions
    WHERE expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*) INTO _sessions_removed FROM deleted_sessions;
  
  RETURN QUERY SELECT _sessions_removed, _tokens_revoked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a view to help diagnose session issues
CREATE OR REPLACE VIEW auth_session_status AS
SELECT 
  u.id as user_id,
  u.email,
  u.last_sign_in_at,
  s.id as session_id,
  s.expires_at as session_expires_at,
  COUNT(rt.id) as refresh_tokens_count,
  SUM(CASE WHEN rt.revoked = false THEN 1 ELSE 0 END) as active_refresh_tokens,
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = u.id) as has_profile
FROM auth.users u
LEFT JOIN auth.sessions s ON u.id = s.user_id
LEFT JOIN auth.refresh_tokens rt ON s.id = rt.session_id
GROUP BY u.id, u.email, u.last_sign_in_at, s.id, s.expires_at
ORDER BY s.expires_at DESC;

-- 5. Fix missing profiles that don't have auto-created links from auth.users
DO $$
DECLARE
  missing_count INT;
BEGIN
  INSERT INTO profiles (id, name, email, joined_date)
  SELECT 
    au.id, 
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)), 
    au.email,
    COALESCE(au.created_at, now())
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  WHERE p.id IS NULL;
  
  GET DIAGNOSTICS missing_count = ROW_COUNT;
  
  RAISE NOTICE 'Fixed % missing profiles', missing_count;
END $$; 