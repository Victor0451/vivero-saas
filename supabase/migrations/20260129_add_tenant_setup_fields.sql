-- Add setup tracking fields to tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false;

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS nursery_name TEXT;

-- Update RLS for tenants if needed (usually OWNER/ADMIN can update their own tenant)
-- This assumes standard RLS is already in place as per README_DATABASE.md
