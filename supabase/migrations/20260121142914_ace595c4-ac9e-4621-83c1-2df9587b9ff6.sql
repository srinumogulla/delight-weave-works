-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'temple';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'field_officer';

-- Add approval_status to pundits table
ALTER TABLE pundits 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- Add check constraint for approval_status
ALTER TABLE pundits 
ADD CONSTRAINT pundits_approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Migrate existing data based on is_verified
UPDATE pundits SET approval_status = 'approved' WHERE is_verified = true;
UPDATE pundits SET approval_status = 'pending' WHERE is_verified = false OR is_verified IS NULL;

-- Add birth details to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS time_of_birth time,
ADD COLUMN IF NOT EXISTS birth_location text;

-- Update RLS policy for public pundits listing (only show approved pundits publicly)
DROP POLICY IF EXISTS "Pundits are viewable by everyone" ON pundits;

CREATE POLICY "Approved pundits are viewable by everyone"
ON pundits FOR SELECT
USING (is_active = true AND approval_status = 'approved');

CREATE POLICY "Pundits can view own record"
ON pundits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Pundits can update own record"
ON pundits FOR UPDATE
USING (auth.uid() = user_id);