-- Create the storage bucket 'plantas' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('plantas', 'plantas', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public access to view photos (read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'plantas' );

-- Policy: Allow authenticated users to upload photos (insert)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'plantas' AND auth.role() = 'authenticated' );

-- Policy: Allow authenticated users to delete photos (delete)
-- Ideally, we should check tenant ownership, but for now we rely on the backend action
-- checking the tenant before calling delete, or we can add tenant check if encoded in path.
-- Path format: {tenant_id}/{plant_id}/{filename}
-- We can check if the path starts with the user's tenant_id.
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'plantas' AND auth.role() = 'authenticated' );
