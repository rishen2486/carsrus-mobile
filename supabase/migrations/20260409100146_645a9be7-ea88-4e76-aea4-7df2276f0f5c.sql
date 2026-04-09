
-- 1. Fix email_otps: Enable RLS and lock down to service_role only
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_otps" ON public.email_otps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Fix payment_logs: Replace public policy with proper access control
DROP POLICY IF EXISTS "Allow full access for service role" ON public.payment_logs;

CREATE POLICY "Service role full access on payment_logs" ON public.payment_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users view own payment logs" ON public.payment_logs
  FOR SELECT TO authenticated
  USING (customer_email = auth.jwt()->>'email');

-- 3. Fix profiles: Prevent privilege escalation via is_admin/superuser
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_admin = false
    AND superuser = false
  );

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_admin = false
    AND superuser = false
  );
