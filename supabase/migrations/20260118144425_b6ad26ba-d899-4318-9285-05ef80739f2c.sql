-- Add pundit role to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'pundit';

-- Add user_id column to pundits table to link pundit accounts
ALTER TABLE public.pundits ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_pundits_user_id ON public.pundits(user_id);

-- Allow authenticated users to read user_roles for pundit check
CREATE POLICY "Users can read their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Allow insert of user role during signup
CREATE POLICY "Users can insert their own role on signup" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());