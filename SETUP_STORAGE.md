# Configuración de Supabase Storage

## Avatares de Usuario

### 1. Crear Bucket para Avatares

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Crear bucket PRIVADO para avatares de usuario (más seguro)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', false);
```

### 2. Políticas RLS para Avatares

```sql
-- Políticas RLS para el bucket user-avatars (PRIVADO)
-- Permitir que cada usuario vea su propio avatar
CREATE POLICY "User can read own avatar"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir subir/actualizar su propio avatar
CREATE POLICY "User can upload own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "User can update own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir eliminar su propio avatar
CREATE POLICY "User can delete own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'user-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Cómo funcionan las URLs

Dado que el bucket es **privado**, las imágenes se acceden mediante **URLs firmadas** (signed URLs) que expiran después de 1 año. Esto es más seguro que URLs públicas permanentes.

---

# Configuración de Supabase Storage para Imágenes de Plantas

## 1. Crear Bucket

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Crear bucket para imágenes de plantas
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-images', 'plant-images', false);
```

## 2. Políticas RLS

Ejecuta las políticas de seguridad:

```sql
-- Políticas RLS para el bucket plant-images
-- Permitir que usuarios autenticados vean imágenes de sus plantas
CREATE POLICY "Users can view plant images from their tenant" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'plant-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT id_tenant::text
      FROM users
      WHERE id_user = auth.uid()
    )
  );

-- Permitir que usuarios autenticados suban imágenes a su tenant
CREATE POLICY "Users can upload plant images to their tenant" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'plant-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT id_tenant::text
      FROM users
      WHERE id_user = auth.uid()
    )
  );

-- Permitir que usuarios autenticados actualicen imágenes de su tenant
CREATE POLICY "Users can update plant images from their tenant" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'plant-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT id_tenant::text
      FROM users
      WHERE id_user = auth.uid()
    )
  );

-- Permitir que usuarios autenticados eliminen imágenes de su tenant
CREATE POLICY "Users can delete plant images from their tenant" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'plant-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT id_tenant::text
      FROM users
      WHERE id_user = auth.uid()
    )
  );
```

## 3. Agregar Campo a la Base de Datos

```sql
-- Agregar columna image_url a la tabla plantas si no existe
ALTER TABLE plantas ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## 4. Verificación

Una vez configurado, puedes verificar que todo funciona:

1. Ve a la página de plantas
2. Crea o edita una planta
3. Sube una imagen usando drag & drop o el selector de archivos
4. La imagen debería guardarse y mostrarse correctamente

## Estructura de Archivos

Las imágenes se almacenan con la siguiente estructura:
```
plant-images/
├── {tenant_id}/
│   ├── {plant_id}.{ext}
│   └── temp_{timestamp}.{ext}
```

Esto asegura aislamiento por tenant y organización por planta.
