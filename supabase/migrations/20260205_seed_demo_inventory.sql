-- Migration: Seed Demo Inventory
-- Tenant ID: 11111111-1111-1111-1111-111111111111 (Demo Tenant)

DO $$ 
DECLARE
    v_tenant_id uuid := '11111111-1111-1111-1111-111111111111';
    v_cat_sustratos_id int;
    v_cat_herramientas_id int;
    v_cat_insumos_id int;
    v_prov_mayorista_id int;
    v_prov_agro_id int;
BEGIN

    ---------------------------------------------------------------------------
    -- 1. CATEGORIAS DE INVENTARIO
    ---------------------------------------------------------------------------
    -- Sustratos
    INSERT INTO public.categorias_inventario (id_tenant, nombre, descripcion, icono, color)
    VALUES (v_tenant_id, 'Sustratos', 'Tierras, compost y abonos', 'sprout', 'brown')
    ON CONFLICT DO NOTHING
    RETURNING id_categoria INTO v_cat_sustratos_id;

    -- Si ya existe y no retornó ID (por el ON CONFLICT), buscarlo
    IF v_cat_sustratos_id IS NULL THEN
        SELECT id_categoria INTO v_cat_sustratos_id FROM public.categorias_inventario 
        WHERE id_tenant = v_tenant_id AND nombre = 'Sustratos';
    END IF;

    -- Herramientas
    INSERT INTO public.categorias_inventario (id_tenant, nombre, descripcion, icono, color)
    VALUES (v_tenant_id, 'Herramientas', 'Palas, tijeras y accesorios', 'hammer', 'gray')
    ON CONFLICT DO NOTHING
    RETURNING id_categoria INTO v_cat_herramientas_id;

    IF v_cat_herramientas_id IS NULL THEN
        SELECT id_categoria INTO v_cat_herramientas_id FROM public.categorias_inventario 
        WHERE id_tenant = v_tenant_id AND nombre = 'Herramientas';
    END IF;

    -- Insumos Varios
    INSERT INTO public.categorias_inventario (id_tenant, nombre, descripcion, icono, color)
    VALUES (v_tenant_id, 'Insumos', 'Macetas plásticas y tutores', 'package', 'blue')
    ON CONFLICT DO NOTHING
    RETURNING id_categoria INTO v_cat_insumos_id;

    IF v_cat_insumos_id IS NULL THEN
        SELECT id_categoria INTO v_cat_insumos_id FROM public.categorias_inventario 
        WHERE id_tenant = v_tenant_id AND nombre = 'Insumos';
    END IF;


    ---------------------------------------------------------------------------
    -- 2. PROVEEDORES
    ---------------------------------------------------------------------------
    -- Vivero Mayorista "El Ceibo"
    INSERT INTO public.proveedores (id_tenant, nombre, contacto, telefono, email, direccion, activo)
    VALUES (v_tenant_id, 'Mayorista El Ceibo', 'Carlos Perez', '11-5555-0001', 'ventas@elceibo.com', 'Av. Siempreviva 123', true)
    ON CONFLICT DO NOTHING
    RETURNING id_proveedor INTO v_prov_mayorista_id;

    IF v_prov_mayorista_id IS NULL THEN
        SELECT id_proveedor INTO v_prov_mayorista_id FROM public.proveedores 
        WHERE id_tenant = v_tenant_id AND nombre = 'Mayorista El Ceibo';
    END IF;

    -- Agroquímicos "Verde Vida"
    INSERT INTO public.proveedores (id_tenant, nombre, contacto, telefono, email, direccion, activo)
    VALUES (v_tenant_id, 'Agro Verde Vida', 'Ana Gomez', '11-5555-0002', 'ana@verdevida.com', 'Ruta 2 Km 40', true)
    ON CONFLICT DO NOTHING
    RETURNING id_proveedor INTO v_prov_agro_id;

    IF v_prov_agro_id IS NULL THEN
        SELECT id_proveedor INTO v_prov_agro_id FROM public.proveedores 
        WHERE id_tenant = v_tenant_id AND nombre = 'Agro Verde Vida';
    END IF;


    ---------------------------------------------------------------------------
    -- 3. ITEMS DE INVENTARIO
    ---------------------------------------------------------------------------
    
    -- Item 1: Tierra Fértil 50L
    INSERT INTO public.items_inventario 
    (id_tenant, id_categoria, codigo, nombre, descripcion, unidad_medida, stock_actual, stock_minimo, precio_costo, precio_venta, activo)
    VALUES 
    (v_tenant_id, v_cat_sustratos_id, 'SUS-001', 'Tierra Fértil 50L', 'Sustrato universal enriquecido', 'unidades', 150, 20, 4500.00, 8500.00, true)
    ON CONFLICT DO NOTHING;

    -- Item 2: Perlita 10L
    INSERT INTO public.items_inventario 
    (id_tenant, id_categoria, codigo, nombre, descripcion, unidad_medida, stock_actual, stock_minimo, precio_costo, precio_venta, activo)
    VALUES 
    (v_tenant_id, v_cat_sustratos_id, 'SUS-002', 'Perlita Agricola 10L', 'Mejorador de drenaje', 'unidades', 45, 10, 1200.00, 2500.00, true)
    ON CONFLICT DO NOTHING;

    -- Item 3: Pala de Mano
    INSERT INTO public.items_inventario 
    (id_tenant, id_categoria, codigo, nombre, descripcion, unidad_medida, stock_actual, stock_minimo, precio_costo, precio_venta, activo)
    VALUES 
    (v_tenant_id, v_cat_herramientas_id, 'HER-001', 'Pala de Mano Metálica', 'Pala ancha reforzada mango de madera', 'unidades', 12, 5, 3500.00, 6800.00, true)
    ON CONFLICT DO NOTHING;

    -- Item 4: Fertilizante Líquido (Stock Bajo)
    INSERT INTO public.items_inventario 
    (id_tenant, id_categoria, codigo, nombre, descripcion, unidad_medida, stock_actual, stock_minimo, precio_costo, precio_venta, activo)
    VALUES 
    (v_tenant_id, v_cat_insumos_id, 'FER-001', 'Fertilizante Floración', 'Potenciador NPK 10-30-20', 'botellas', 3, 10, 2800.00, 5500.00, true)
    ON CONFLICT DO NOTHING;


    RAISE NOTICE '✅ Inventario Demo sembrado correctamente.';
END $$;
