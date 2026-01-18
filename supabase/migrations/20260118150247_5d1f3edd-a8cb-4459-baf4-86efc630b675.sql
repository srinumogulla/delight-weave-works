-- Create saved_items table for favorites functionality
CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('pooja', 'pundit', 'temple')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_items
CREATE POLICY "Users can view own saved items" 
ON public.saved_items 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved items" 
ON public.saved_items 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items" 
ON public.saved_items 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create storage bucket for pundit photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pundit-photos', 'pundit-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pundit photos
CREATE POLICY "Anyone can view pundit photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pundit-photos');

CREATE POLICY "Authenticated users can upload pundit photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pundit-photos');

CREATE POLICY "Users can update their own pundit photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pundit-photos');

CREATE POLICY "Users can delete their own pundit photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pundit-photos');