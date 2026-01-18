-- Create temples table
CREATE TABLE public.temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  deity TEXT,
  location TEXT,
  state TEXT,
  city TEXT,
  description TEXT,
  image_url TEXT,
  contact_phone TEXT,
  website_url TEXT,
  is_partner BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pundits table
CREATE TABLE public.pundits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  specializations TEXT[],
  languages TEXT[],
  experience_years INTEGER,
  location TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on temples
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to temples
CREATE POLICY "Temples are viewable by everyone" 
ON public.temples 
FOR SELECT 
USING (is_active = true);

-- Enable RLS on pundits
ALTER TABLE public.pundits ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to pundits
CREATE POLICY "Pundits are viewable by everyone" 
ON public.pundits 
FOR SELECT 
USING (is_active = true);

-- Add triggers for updated_at
CREATE TRIGGER update_temples_updated_at
BEFORE UPDATE ON public.temples
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pundits_updated_at
BEFORE UPDATE ON public.pundits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();