-- Add new columns to pooja_services for ritual types
ALTER TABLE pooja_services 
ADD COLUMN IF NOT EXISTS ritual_type TEXT DEFAULT 'dashachara',
ADD COLUMN IF NOT EXISTS guru_name TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_time TEXT;

-- Create events table for community events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view active events
CREATE POLICY "Anyone can view active events" ON events
FOR SELECT USING (is_active = true);

-- Admins can manage events
CREATE POLICY "Admins can manage events" ON events
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create gift_bookings table
CREATE TABLE IF NOT EXISTS gift_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_address TEXT,
  occasion TEXT,
  message TEXT,
  booking_date DATE NOT NULL,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  send_prasadam BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on gift_bookings
ALTER TABLE gift_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own gift bookings
CREATE POLICY "Users can view own gift bookings" ON gift_bookings
FOR SELECT USING (auth.uid() = user_id);

-- Users can create gift bookings
CREATE POLICY "Users can create gift bookings" ON gift_bookings
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all gift bookings
CREATE POLICY "Admins can view all gift bookings" ON gift_bookings
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update gift bookings
CREATE POLICY "Admins can update gift bookings" ON gift_bookings
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on gift_bookings
CREATE TRIGGER update_gift_bookings_updated_at
BEFORE UPDATE ON gift_bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();