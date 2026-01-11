-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  gotra TEXT,
  nakshatra TEXT,
  rashi TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create pooja_services table
CREATE TABLE public.pooja_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration TEXT,
  temple TEXT,
  image_url TEXT,
  benefits TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on pooja_services
ALTER TABLE public.pooja_services ENABLE ROW LEVEL SECURITY;

-- Everyone can view active services
CREATE POLICY "Anyone can view active services" ON public.pooja_services 
  FOR SELECT USING (is_active = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage services" ON public.pooja_services 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.pooja_services(id) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT,
  sankalpa_name TEXT NOT NULL,
  gotra TEXT,
  nakshatra TEXT,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON public.bookings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own pending bookings
CREATE POLICY "Users can update own pending bookings" ON public.bookings 
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings" ON public.bookings 
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Create saved_poojas table
CREATE TABLE public.saved_poojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.pooja_services(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Enable RLS on saved_poojas
ALTER TABLE public.saved_poojas ENABLE ROW LEVEL SECURITY;

-- Users can manage own saved poojas
CREATE POLICY "Users can view own saved poojas" ON public.saved_poojas 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add saved poojas" ON public.saved_poojas 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved poojas" ON public.saved_poojas 
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pooja_services_updated_at
  BEFORE UPDATE ON public.pooja_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample pooja services
INSERT INTO public.pooja_services (name, description, category, price, duration, temple, image_url, benefits, is_active) VALUES
('Ganesh Homam', 'Sacred fire ritual dedicated to Lord Ganesha for removing obstacles and new beginnings', 'Homam', 2100, '2-3 hours', 'Siddhivinayak Temple', '/ritual-homam.jpg', ARRAY['Remove obstacles', 'New beginnings', 'Success in endeavors'], true),
('Maha Abhishekam', 'Grand ritual bathing of the deity with sacred substances', 'Abhishekam', 1500, '1-2 hours', 'Tirupati Temple', '/ritual-abhishekam.jpg', ARRAY['Divine blessings', 'Purification', 'Spiritual merit'], true),
('Lakshmi Pooja', 'Worship of Goddess Lakshmi for wealth, prosperity and abundance', 'Pooja', 1100, '1 hour', 'Mahalakshmi Temple', '/ritual-lakshmi.jpg', ARRAY['Wealth attraction', 'Financial stability', 'Prosperity'], true),
('Navagraha Shanti', 'Planetary peace ritual to appease all nine planets', 'Shanti', 3500, '3-4 hours', 'Navagraha Temple', '/ritual-shanti.jpg', ARRAY['Planetary harmony', 'Remove doshas', 'Life balance'], true),
('Satyanarayan Vratam', 'Sacred vow and worship of Lord Satyanarayan', 'Vratam', 2500, '2-3 hours', 'Vishnu Temple', '/ritual-vratam.jpg', ARRAY['Fulfilled wishes', 'Family harmony', 'Spiritual growth'], true),
('Rudrabhishekam', 'Sacred abhishekam to Lord Shiva with 11 items', 'Abhishekam', 2800, '2 hours', 'Kashi Vishwanath', '/ritual-pooja.jpg', ARRAY['Health', 'Peace of mind', 'Moksha'], true);