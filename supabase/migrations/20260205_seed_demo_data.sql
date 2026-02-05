-- Migration: Seed Demo Data
-- Tenant ID: 11111111-1111-1111-1111-111111111111

-- 1. Create Demo Tenant
INSERT INTO public.tenants (id_tenant, nombre, plan, activo)
VALUES ('11111111-1111-1111-1111-111111111111', 'Vivero Demo', 'pro', true)
ON CONFLICT (id_tenant) DO NOTHING;

-- 2. Create Catalogues (Genres)
INSERT INTO public.generos_planta (id_tenant, nombre, descripcion) VALUES
('11111111-1111-1111-1111-111111111111', 'Tropicales', 'Plantas de interior de alta humedad'),
('11111111-1111-1111-1111-111111111111', 'Suculentas', 'Cactus y crasas de bajo riego'),
('11111111-1111-1111-1111-111111111111', 'Aromáticas', 'Para cocina y huerta')
ON CONFLICT DO NOTHING;

-- 3. Create Catalogues (Macetas)
INSERT INTO public.macetas (id_tenant, tipo, material, diametro_cm) VALUES
('11111111-1111-1111-1111-111111111111', 'Clásica', 'Barro', 15),
('11111111-1111-1111-1111-111111111111', 'Jardinera', 'Plástico', 40),
('11111111-1111-1111-1111-111111111111', 'Colgante', 'Cerámica', 20)
ON CONFLICT DO NOTHING;

-- Helper function to get catalogue IDs (assuming names are unique per tenant for this seed)
-- We will just use subqueries in the inserts below.

-- 4. Create Plants
-- Plant 1: Monstera (Tropical, Healthy)
INSERT INTO public.plantas (id_tenant, nombre, id_genero, id_tipo, id_maceta, fecha_compra, iluminacion, esta_enferma, esta_muerta, observaciones, image_url)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    'Monstera Deliciosa',
    (SELECT id_genero FROM generos_planta WHERE nombre = 'Tropicales' AND id_tenant = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    1, -- Assuming 1 is Interior (Tipos usually global or seeded elsewhere, referencing ID 1 for now)
    (SELECT id_maceta FROM macetas WHERE material = 'Barro' AND id_tenant = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    CURRENT_DATE - INTERVAL '6 months',
    'sol-indirecto',
    false,
    false,
    'Cuidar el exceso de riego en invierno.',
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM plantas WHERE nombre = 'Monstera Deliciosa' AND id_tenant = '11111111-1111-1111-1111-111111111111');

-- Plant 2: Aloe Vera (Suculenta, Sick)
INSERT INTO public.plantas (id_tenant, nombre, id_genero, id_tipo, id_maceta, fecha_compra, iluminacion, esta_enferma, esta_muerta, observaciones, image_url)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    'Aloe Vera Medicinal',
    (SELECT id_genero FROM generos_planta WHERE nombre = 'Suculentas' AND id_tenant = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    2, -- Assuming 2 is Exterior
    (SELECT id_maceta FROM macetas WHERE material = 'Barro' AND id_tenant = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    CURRENT_DATE - INTERVAL '1 year',
    'sol-directo',
    true, -- Sick!
    false,
    'Presenta manchas marrones en las puntas.',
    'https://images.unsplash.com/photo-1628619714778-57bd636bd327?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM plantas WHERE nombre = 'Aloe Vera Medicinal' AND id_tenant = '11111111-1111-1111-1111-111111111111');

-- Plant 3: Albahaca (Aromática, Dead)
INSERT INTO public.plantas (id_tenant, nombre, id_genero, id_tipo, id_maceta, fecha_compra, iluminacion, esta_enferma, esta_muerta, observaciones)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    'Albahaca Genovesa',
    (SELECT id_genero FROM generos_planta WHERE nombre = 'Aromáticas' AND id_tenant = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    2,
    (SELECT id_maceta FROM macetas WHERE material = 'Plástico' AND id_tenant = '11111111-1111-1111-1111-111111111111' LIMIT 1),
    CURRENT_DATE - INTERVAL '2 months',
    'sol-directo',
    false,
    true, -- Dead
    'Se secó por falta de riego durante el fin de semana largo.'
WHERE NOT EXISTS (SELECT 1 FROM plantas WHERE nombre = 'Albahaca Genovesa' AND id_tenant = '11111111-1111-1111-1111-111111111111');

-- 5. Create History (Clinical History) for Aloe Vera (The sick one)
INSERT INTO public.historia_clinica (id_tenant, id_planta, fecha, descripcion, tipo_evento, severidad, estuvo_enferma)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    (SELECT id_planta FROM plantas WHERE nombre = 'Aloe Vera Medicinal' AND id_tenant = '11111111-1111-1111-1111-111111111111'),
    CURRENT_DATE - INTERVAL '5 days',
    'Detección de hongos por exceso de humedad.',
    'Diagnóstico de Enfermedad',
    'media',
    true
WHERE EXISTS (SELECT 1 FROM plantas WHERE nombre = 'Aloe Vera Medicinal' AND id_tenant = '11111111-1111-1111-1111-111111111111');

-- 6. Create Tasks (Pending Watering for Monstera)
INSERT INTO public.tareas (id_tenant, id_planta, titulo, descripcion, fecha_programada, completada)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    (SELECT id_planta FROM plantas WHERE nombre = 'Monstera Deliciosa' AND id_tenant = '11111111-1111-1111-1111-111111111111'),
    'Riego Profundo',
    'Verificar humedad a 2cm de profundidad.',
    CURRENT_DATE + INTERVAL '1 day',
    false
WHERE EXISTS (SELECT 1 FROM plantas WHERE nombre = 'Monstera Deliciosa' AND id_tenant = '11111111-1111-1111-1111-111111111111');
