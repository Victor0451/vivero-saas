-- Add plan column to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'semilla' NOT NULL;

-- Update existing tenants to 'semilla' (default) if they are null (though default handles new ones)
UPDATE public.tenants SET plan = 'semilla' WHERE plan IS NULL;

-- Set the Demo Tenant (if exists) and 'BioFlora' / 'GreenHub' to higher plans for showcase
-- Assuming Demo Tenant Name contains 'Demo'
UPDATE public.tenants SET plan = 'brote' WHERE nursery_name ILIKE '%Demo%';
