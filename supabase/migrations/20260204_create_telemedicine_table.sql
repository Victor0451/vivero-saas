-- Create table for Shared Consultations (Interconsultas)
create table if not exists public.consultas_compartidas (
    id uuid default gen_random_uuid() primary key,
    id_planta bigint not null references public.plantas(id_planta) on delete cascade,
    id_tenant uuid not null references public.tenants(id_tenant),
    token text not null unique default encode(gen_random_bytes(16), 'hex'),
    titulo text, -- Optional title for the case (e.g. "Consulta por Manchas Negras")
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone, -- Null means no expiration, or set default +7 days
    active boolean default true
);

-- Index for fast token lookups
create index if not exists idx_consultas_token on public.consultas_compartidas(token);

-- RLS Policies
alter table public.consultas_compartidas enable row level security;

-- Only tenant members can CREATE specific links
create policy "Tenant members can manage shared links"
    on public.consultas_compartidas
    for all
    using ( public.get_current_tenant_id() = id_tenant );

-- PUBLIC ACCESS POLICY?
-- We do NOT want to expose this table directly to public anon users via standard SELECT *
-- Instead, we will use a secure RPC or server-side admin client to fetch by token.
-- However, if we want to use standard client methods, we could allow select by token match.
-- For now, let's keep it restricted and use Server Actions (Service Role) to fetch the public data.
