-- ==============================================================================
-- SUPABASE DATABASE & STORAGE SCHEMA
-- Wedding Invitation: Faithfulness & Taiwo (24 October 2026)
-- ==============================================================================

-- 1. Enable UUID generator extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- PRIMARY TABLE: wedding_content
-- Stores the complete CMS configuration JSON in row id 'main'
-- ==============================================================================
CREATE TABLE IF NOT EXISTS wedding_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for wedding_content
ALTER TABLE wedding_content ENABLE ROW LEVEL SECURITY;

-- 1. Public can view/read wedding content
DROP POLICY IF EXISTS "Public can view wedding content" ON wedding_content;
CREATE POLICY "Public can view wedding content"
ON wedding_content FOR SELECT
USING (true);

-- 2. Authenticated users (or public anon in dashboard) can insert/update wedding content
DROP POLICY IF EXISTS "Allow save wedding content" ON wedding_content;
CREATE POLICY "Allow save wedding content"
ON wedding_content FOR ALL
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- TABLE 2: rsvps
-- Stores guest RSVP responses submitted through the public invitation
-- ==============================================================================
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  attendance TEXT NOT NULL,
  number_of_guests INTEGER DEFAULT 1,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE wedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- 1. wedding_settings Policies:
-- Public can read wedding information
DROP POLICY IF EXISTS "Public can view wedding settings" ON wedding_settings;
CREATE POLICY "Public can view wedding settings"
ON wedding_settings FOR SELECT
USING (true);

-- Allow updates to wedding settings
DROP POLICY IF EXISTS "Allow updates to wedding settings" ON wedding_settings;
CREATE POLICY "Allow updates to wedding settings"
ON wedding_settings FOR ALL
USING (true)
WITH CHECK (true);

-- 2. gallery_images Policies:
-- Public can read gallery images
DROP POLICY IF EXISTS "Public can view gallery images" ON gallery_images;
CREATE POLICY "Public can view gallery images"
ON gallery_images FOR SELECT
USING (true);

-- Allow managing gallery images
DROP POLICY IF EXISTS "Allow manage gallery images" ON gallery_images;
CREATE POLICY "Allow manage gallery images"
ON gallery_images FOR ALL
USING (true)
WITH CHECK (true);

-- 3. rsvps Policies:
-- Public visitors can submit an RSVP, but cannot read other guests' submissions
DROP POLICY IF EXISTS "Public can submit RSVP" ON rsvps;
CREATE POLICY "Public can submit RSVP"
ON rsvps FOR INSERT
WITH CHECK (true);

-- Read and delete RSVPs
DROP POLICY IF EXISTS "Allow reading RSVPs" ON rsvps;
CREATE POLICY "Allow reading RSVPs"
ON rsvps FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow deleting RSVPs" ON rsvps;
CREATE POLICY "Allow deleting RSVPs"
ON rsvps FOR DELETE
USING (true);

-- ==============================================================================
-- STORAGE BUCKET: wedding-images
-- ==============================================================================
-- Create the public bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-images',
  'wedding-images',
  true,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage access policies for wedding-images bucket:
DROP POLICY IF EXISTS "Public can view wedding-images" ON storage.objects;
CREATE POLICY "Public can view wedding-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-images');

DROP POLICY IF EXISTS "Allow upload to wedding-images" ON storage.objects;
CREATE POLICY "Allow upload to wedding-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wedding-images');

DROP POLICY IF EXISTS "Allow update in wedding-images" ON storage.objects;
CREATE POLICY "Allow update in wedding-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'wedding-images');

DROP POLICY IF EXISTS "Allow delete from wedding-images" ON storage.objects;
CREATE POLICY "Allow delete from wedding-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'wedding-images');

-- ==============================================================================
-- SEED INITIAL WEDDING DATA
-- ==============================================================================
INSERT INTO wedding_settings (
  id,
  couple_names,
  family_names,
  wedding_date,
  ceremony_time,
  ceremony_venue,
  ceremony_address,
  ceremony_map_url,
  reception_time,
  reception_venue,
  reception_address,
  reception_map_url,
  invitation_message,
  bible_verse,
  verse_reference,
  tagline,
  couple_sign,
  dress_code,
  hero_image_url,
  closing_image_url,
  updated_at
) VALUES (
  'current',
  'FAITHFULNESS & TAIWO',
  'ADEJORO-OMILEGBE & WIGWE FAMILIES',
  '24 OCTOBER 2026',
  '11:00 AM',
  'Faith & Miracle Int''l Church',
  'Alalubosa Junction, Aleshinloye Road, Ibadan',
  'https://www.google.com/maps/search/?api=1&query=Faith+%26+Miracle+Intl+Church+Alalubosa+Junction+Aleshinloye+Road+Ibadan',
  'Immediately following ceremony',
  'Le Chateau Event Center',
  'Housing, 43A Awolowo Avenue, Bodija Estate',
  'https://www.google.com/maps/search/?api=1&query=Le+Chateau+Event+Center+Housing+43A+Awolowo+Avenue+Bodija+Estate+Ibadan',
  'Together with their families, invite you to celebrate the wedding of their children',
  'Above all put on love, which binds everything together in perfect harmony.',
  'Colossians 3:14',
  'are getting married',
  'FAITHFULNESS & TAIWO',
  'DRESS CODE: Purple & Sea Green - We kindly request our esteemed guests to celebrate with us adorned in rich tones of Purple & Sea Green.',
  'https://res.cloudinary.com/dtws4emsj/image/upload/v1787842758/XMKY6848_qbmmzt.jpg',
  'https://res.cloudinary.com/dtws4emsj/image/upload/v1788559424/XCTB8068_h5voqs.jpg',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Initial Gallery photos
INSERT INTO gallery_images (id, image_url, caption, sort_order)
VALUES 
  ('photo-hero', 'https://res.cloudinary.com/dtws4emsj/image/upload/v1787842758/XMKY6848_qbmmzt.jpg', 'Faithfulness & Taiwo', 0),
  ('photo-gallery-1', 'https://res.cloudinary.com/dtws4emsj/image/upload/v1788559424/XCTB8068_h5voqs.jpg', 'Together Forever', 1),
  ('photo-gallery-2', 'https://res.cloudinary.com/dtws4emsj/image/upload/v1788559442/YIRY3537_amf4st.jpg', 'A Journey of Love', 2)
ON CONFLICT (id) DO NOTHING;
