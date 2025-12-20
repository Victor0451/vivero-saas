# 🌱 Sistema SaaS de Gestión de Plantas – Documentación Técnica

## 1. Introducción
Este documento describe la **arquitectura de base de datos**, scripts SQL y decisiones de diseño
para un sistema **SaaS multi-tenant** de gestión, clasificación e historial de plantas,
integrado con **Supabase Auth** y pensado para **Next.js (App Router + TypeScript)**.

Este archivo está pensado para usarse como:
- `README.md` técnico
- Documentación interna del proyecto
- Referencia para onboarding de desarrolladores

---

## 2. Conceptos Clave

- **Tenant**: organización / vivero / cliente
- **User**: usuario autenticado
- Un tenant tiene múltiples usuarios
- Un usuario pertenece a un solo tenant
- El aislamiento de datos se garantiza mediante **Row Level Security (RLS)**

> 🔐 La seguridad vive en la base de datos, no en el frontend.

---

## 3. Arquitectura General

- Autenticación: `auth.users` (Supabase)
- Usuarios de dominio: `public.users`
- Multi-tenant por `id_tenant`
- Triggers SQL para automatizar altas
- RLS en todas las tablas sensibles

---

## 4. Esquema de Base de Datos

### 4.1 tenants
```sql
CREATE TABLE public.tenants (
  id_tenant uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  plan text,
  activo boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);
```

---

### 4.2 users
```sql
CREATE TABLE public.users (
  id_user uuid PRIMARY KEY,
  id_tenant uuid NOT NULL,
  rol text DEFAULT 'USER',
  activo boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  CONSTRAINT users_id_user_fkey FOREIGN KEY (id_user) REFERENCES auth.users(id),
  CONSTRAINT users_id_tenant_fkey FOREIGN KEY (id_tenant) REFERENCES public.tenants(id_tenant)
);
```

Roles:
- OWNER
- ADMIN
- USER

---

### 4.3 tipos_planta
```sql
CREATE TABLE public.tipos_planta (
  id_tipo smallint PRIMARY KEY,
  nombre text UNIQUE NOT NULL
);
```

---

### 4.4 generos_planta
```sql
CREATE TABLE public.generos_planta (
  id_genero bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_tenant uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  FOREIGN KEY (id_tenant) REFERENCES public.tenants(id_tenant)
);
```

---

### 4.5 macetas
```sql
CREATE TABLE public.macetas (
  id_maceta bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_tenant uuid NOT NULL,
  tipo text NOT NULL,
  material text,
  diametro_cm numeric,
  altura_cm numeric,
  volumen_lts numeric,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (id_tenant) REFERENCES public.tenants(id_tenant)
);
```

---

### 4.6 plantas
```sql
CREATE TABLE public.plantas (
  id_planta bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_tenant uuid NOT NULL,
  nombre text NOT NULL,
  floracion boolean DEFAULT false,
  fecha_compra date,
  fecha_transplante date,
  iluminacion text,
  esta_enferma boolean DEFAULT false,
  esta_muerta boolean DEFAULT false,
  id_maceta bigint,
  id_genero bigint NOT NULL,
  id_tipo smallint NOT NULL,
  observaciones text,
  created_at timestamp DEFAULT now(),
  deleted_at timestamp,
  FOREIGN KEY (id_tenant) REFERENCES public.tenants(id_tenant),
  FOREIGN KEY (id_maceta) REFERENCES public.macetas(id_maceta),
  FOREIGN KEY (id_genero) REFERENCES public.generos_planta(id_genero),
  FOREIGN KEY (id_tipo) REFERENCES public.tipos_planta(id_tipo)
);
```

---

### 4.7 historia_clinica
```sql
CREATE TABLE public.historia_clinica (
  id_historia bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_tenant uuid NOT NULL,
  id_planta bigint NOT NULL,
  fecha date NOT NULL,
  descripcion text NOT NULL,
  tratamiento text,
  estuvo_enferma boolean,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (id_tenant) REFERENCES public.tenants(id_tenant),
  FOREIGN KEY (id_planta) REFERENCES public.plantas(id_planta)
);
```

---

### 4.8 tareas
```sql
CREATE TABLE public.tareas (
  id_tarea bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_tenant uuid NOT NULL,
  id_planta bigint,
  titulo text NOT NULL,
  descripcion text,
  fecha_programada date,
  completada boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (id_tenant) REFERENCES public.tenants(id_tenant),
  FOREIGN KEY (id_planta) REFERENCES public.plantas(id_planta)
);
```

---

## 5. Invitaciones de Usuarios
```sql
CREATE TABLE public.invitaciones (
  id_invitacion uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  id_tenant uuid NOT NULL,
  rol text DEFAULT 'USER',
  aceptada boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);
```

---

## 6. Automatización de Alta de Usuarios

### 6.1 Función SQL
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_invitation record;
  tenant_id uuid;
BEGIN
  SELECT * INTO existing_invitation
  FROM public.invitaciones
  WHERE email = new.email AND aceptada = false
  LIMIT 1;

  IF FOUND THEN
    tenant_id := existing_invitation.id_tenant;
    UPDATE public.invitaciones
    SET aceptada = true
    WHERE id_invitacion = existing_invitation.id_invitacion;
  ELSE
    INSERT INTO public.tenants (nombre)
    VALUES ('Tenant de ' || new.email)
    RETURNING id_tenant INTO tenant_id;
  END IF;

  INSERT INTO public.users (id_user, id_tenant, rol)
  VALUES (new.id, tenant_id, COALESCE(existing_invitation.rol, 'OWNER'));

  RETURN new;
END;
$$;
```

---

### 6.2 Trigger
```sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();
```

---

## 7. Seguridad – RLS

### Patrón base
```sql
id_tenant IN (
  SELECT id_tenant
  FROM public.users
  WHERE id_user = auth.uid()
)
```

### Ejemplo: plantas
```sql
ALTER TABLE public.plantas ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_access_plantas
ON public.plantas
FOR ALL
USING (
  id_tenant IN (
    SELECT id_tenant FROM public.users WHERE id_user = auth.uid()
  )
);
```

Este patrón se replica en todas las tablas multi-tenant.

---

## 8. Buenas Prácticas

- Nunca confiar en `id_tenant` desde el frontend
- RLS como única fuente de verdad
- Triggers para lógica crítica
- Soft delete con `deleted_at`
- Arquitectura lista para SaaS

---

## 9. Estado del Sistema

✅ Multi-tenant funcional  
✅ Supabase Auth integrado  
✅ Seguridad por RLS  
✅ Escalable y mantenible  

---

## 10. Próximas Extensiones

- Auditoría y logs
- Permisos granulares
- Facturación por tenant
- Métricas y monitoreo

---

📌 **Este archivo puede usarse directamente como `README.md` del proyecto.**
