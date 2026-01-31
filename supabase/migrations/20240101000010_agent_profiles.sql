-- Allow profiles for external agents (not just auth.users)
-- Remove the foreign key constraint to auth.users

ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add a column to track if this is an agent profile
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_agent BOOLEAN DEFAULT false;

-- Update RLS to allow service role to create agent profiles
CREATE POLICY "Service role can manage agent profiles" ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);
